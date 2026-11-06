import { useRef, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useSearchParams } from 'react-router-dom';

// TODO: 결제 · 잔액 API와 결제 유틸을 공통 위치(src/api)로 옮길지 꿈 기록 담당과 협의 (지금은 꿈 기록 쪽 그대로 사용)
import { dreamRecordApi, errorMessage } from '@/features/dream-record/api/dreamRecordApi';

import {
  dreamPaymentApi,
  isPaymentComplete,
  paymentErrorMessage,
  paymentLink,
  type CreditProduct,
  type PaymentOrder,
} from '@/features/dream-record/api/dreamPaymentApi';
import {
  createPendingPaymentRequest,
  isPaymentRecoveryExpired,
  isValidBuyerPhone,
  normalizeBuyerPhone,
  parsePendingPaymentRequest,
} from '@/features/dream-record/utils/paymentRecovery';
import {
  canClearPaymentOrder,
  isPaymentPollingStopped,
} from '@/features/dream-record/utils/paymentState';
import { confirmPaymentForImage } from '@/features/dream-record/utils/paymentWorkflow';
import { runWithRequestLock } from '@/features/dream-record/utils/requestLock';

import FlowModal from './FlowModal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import TokenCost from './TokenCost';

interface Props {
  // 결제 요청 흔적을 남길 sessionStorage 키 (화면마다 다르게, 예: 꿈 id · 세계관 id 기준)
  storageKey: string;
  cost: number;
  canGenerate: boolean;
  onContinue: () => void;
  // 결제 완료 후 "토큰 사용하고 이미지 생성" 버튼 표시 여부 (충전만 하는 토큰 충전 페이지에서는 false)
  showGenerateButton?: boolean;
}

const orderLabels: Record<PaymentOrder['state'], string> = {
  REQUESTING: '결제 요청을 확인하고 있어요.',
  READY: '결제창에서 결제를 진행해 주세요.',
  REQUEST_REJECTED: '결제 요청이 거절되었어요.',
  UNKNOWN: '결제 결과 확인 중이에요. 새로 결제하지 말고 상태를 확인해 주세요.',
  PENDING: '결제 완료를 기다리고 있어요.',
  PAID: '결제가 완료되었어요.',
  CANCELLED: '결제가 취소되었어요.',
  PAYMENT_REVIEW: '결제 확인이 필요해요. 확인이 끝날 때까지 기다려 주세요.',
  CREDIT_RECLAIMED: '결제가 취소되어 지급 토큰이 회수되었어요.',
};

function readPendingRequest(key: string) {
  try {
    return parsePendingPaymentRequest(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}

function isMissingRecoveredOrder(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 404 &&
    error.response.data?.code === 'PAYMENT_404_1'
  );
}

// 토큰 충전 화면 (꿈 기록 · 꿈 연결 공통, 꿈 기록 담당이 피그마대로 만든 화면)
// - 결제 처리 · 화면은 그대로, 충전 후 돌아갈 동작(onContinue)과 결제 기록 키(storageKey)만 각 화면에서 전달
// - 주문 번호는 주소의 ?orderId= 로 유지 (결제창에서 돌아오거나 새로고침해도 이어서 확인)
export default function CreditCharge({
  storageKey,
  cost,
  canGenerate,
  onContinue,
  showGenerateButton = true,
}: Props) {
  const [params, setParams] = useSearchParams();

  const orderId = params.get('orderId');
  const key = storageKey;

  const [pendingRequest, setPendingRequest] = useState(() => readPendingRequest(key));

  const [phone, setPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CreditProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const lock = useRef(false);
  const queryClient = useQueryClient();

  const products = useQuery({
    queryKey: ['dream-payments', 'products'],
    queryFn: ({ signal }) => dreamPaymentApi.products(signal),
    retry: false,
  });

  const order = useQuery({
    queryKey: ['dream-payments', 'order', orderId],
    queryFn: ({ signal }) => dreamPaymentApi.order(orderId!, signal),
    enabled: !!orderId,
    retry: false,
    refetchOnWindowFocus: 'always',
    refetchInterval: (query) =>
      query.state.error || !query.state.data || isPaymentPollingStopped(query.state.data)
        ? false
        : 3000,
  });

  const recoveredOrder = useQuery({
    queryKey: ['dream-payments', 'request', pendingRequest?.requestId],
    queryFn: ({ signal }) => dreamPaymentApi.byRequestId(pendingRequest!.requestId, signal),
    enabled: !!pendingRequest && !orderId,
    retry: false,
    refetchOnWindowFocus: 'always',
    refetchInterval: () =>
      pendingRequest && !isPaymentRecoveryExpired(pendingRequest) ? 3000 : false,
  });

  const paid = isPaymentComplete(order.data);

  const balance = useQuery({
    queryKey: ['dream-payments', 'balance', orderId, paid],
    queryFn: ({ signal }) => dreamRecordApi.balance(signal),
    retry: false,
  });

  const url = paymentLink(order.data);

  const clearable = canClearPaymentOrder(order.data);
  const recoveryExpired = pendingRequest ? isPaymentRecoveryExpired(pendingRequest) : false;
  const recoveryMissing = isMissingRecoveredOrder(recoveredOrder.error);

  const queryError =
    products.error ||
    order.error ||
    balance.error ||
    (!recoveryMissing ? recoveredOrder.error : null);

  function chooseOrder(value: PaymentOrder) {
    queryClient.setQueryData(['dream-payments', 'order', value.orderId], value);
    setSelectedProduct(null);

    setParams(
      (current) => {
        current.set('orderId', value.orderId);
        return current;
      },
      { replace: true },
    );

    setMessage('');
  }

  async function create(product: CreditProduct) {
    if (pendingRequest || orderId) {
      return;
    }

    const buyerPhone = normalizeBuyerPhone(phone);

    if (!isValidBuyerPhone(buyerPhone)) {
      setMessage('휴대폰 번호를 정확히 입력해 주세요.');
      return;
    }

    await runWithRequestLock(lock, async () => {
      setBusy(true);
      setMessage('');

      try {
        const requestId = crypto.randomUUID();
        const pending = createPendingPaymentRequest({
          requestId,
          productId: product.productId,
        });

        // 응답을 놓친 주문을 자동으로 다시 만들지 않도록 요청 흔적을 남긴다.
        // requestId와 상품 ID만 탭 단위 저장소에 보관하고 완료 후 지운다.
        try {
          sessionStorage.setItem(key, JSON.stringify(pending));
        } catch {
          setMessage('주문 식별자를 안전하게 보관할 수 없어 결제를 시작하지 않았어요.');
          return;
        }

        setPendingRequest(pending);

        const result = await dreamPaymentApi.create({
          requestId,
          productId: product.productId,
          buyerPhone,
        });

        chooseOrder(result);
      } catch (error) {
        if (axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0)) {
          try {
            sessionStorage.removeItem(key);
          } catch {
            // 서버가 거절한 요청은 화면에서 다시 선택할 수 있게 한다.
          }

          setPendingRequest(null);
          setMessage(paymentErrorMessage(error));
        } else {
          setMessage(
            `${paymentErrorMessage(error)} 같은 주문 식별자를 유지하고 상태를 먼저 확인해 주세요.`,
          );
        }
      } finally {
        setBusy(false);
      }
    });
  }

  function clearTerminalOrder() {
    if (!clearable) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // 서버에서 확인한 주문 상태를 기준으로 처리한다.
    }

    setPendingRequest(null);

    setParams(
      (current) => {
        current.delete('orderId');
        return current;
      },
      { replace: true },
    );

    setMessage('');
  }

  async function continueGeneration() {
    if (!canGenerate || !orderId) {
      return;
    }

    await runWithRequestLock(lock, async () => {
      setBusy(true);
      setMessage('');

      try {
        const result = await confirmPaymentForImage(orderId, cost, {
          order: (id) => dreamPaymentApi.order(id),
          balance: () => dreamRecordApi.balance(),
        });

        queryClient.setQueryData(['dream-payments', 'order', orderId], result.order);

        if (result.kind === 'waiting') {
          throw new Error('결제가 아직 확인되지 않았어요.');
        }

        queryClient.setQueryData(['dream-record', 'balance'], result.balance);

        if (result.kind === 'insufficient') {
          throw new Error('토큰 반영을 확인한 뒤 다시 시도해 주세요.');
        }

        try {
          sessionStorage.removeItem(key);
        } catch {
          // 실제 결제 완료 여부와 잔액은 서버에서 이미 확인했다.
        }

        onContinue();
      } catch (error) {
        setMessage(errorMessage(error));
      } finally {
        setBusy(false);
      }
    });
  }

  if (!orderId && recoveredOrder.data) {
    const restoredParams = new URLSearchParams(params);
    restoredParams.set('orderId', recoveredOrder.data.orderId);

    return <Navigate replace to={{ search: `?${restoredParams.toString()}` }} />;
  }

  return (
    <section className="flex flex-col gap-[14px]">
      <div className="flex min-h-[53px] items-center justify-between rounded-2xl bg-[#292834] px-5 py-4">
        <span className="text-[14px] text-[#737377]">보유 토큰</span>
        <strong className="text-[14px] font-semibold">{balance.data?.available ?? '—'} 개</strong>
      </div>

      {!orderId && !pendingRequest && (
        <>
          {products.isPending && (
            <p role="status" className="px-1 text-sm text-b-400">
              충전 상품을 불러오고 있어요.
            </p>
          )}

          {products.data?.length === 0 && (
            <p className="px-1 text-sm text-b-400">현재 구매할 수 있는 상품이 없어요.</p>
          )}

          {!!products.data?.length && (
            <div className="flex flex-col gap-6 rounded-2xl bg-[#292834] px-5 py-4">
              {products.data.map((product) => (
                <div
                  key={product.productId}
                  className="flex min-h-[34px] items-center justify-between gap-4"
                >
                  <p className="text-[14px] font-medium text-b-200" title={product.name}>
                    {product.credits} 토큰
                  </p>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setSelectedProduct(product)}
                    className="h-[34px] min-w-[100px] rounded-full bg-[#7a6ce3] px-4 text-[14px] font-semibold text-b-200 disabled:opacity-40"
                  >
                    {product.price.toLocaleString('ko-KR')}
                    {product.currency === 'KRW' ? '원' : ` ${product.currency}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!!pendingRequest && !orderId && (
        <>
          <p role="status" className="text-sm text-b-400">
            {recoveryExpired
              ? '주문 확인이 오래 걸리고 있어요. 새 주문을 만들지 말고 고객센터에 문의해 주세요.'
              : '저장한 주문 식별자로 결제 요청을 확인하고 있어요.'}
          </p>

          {recoveryMissing && !recoveryExpired && (
            <p className="text-sm text-b-400">
              주문 생성 처리 중일 수 있어요. 같은 식별자를 유지한 채 잠시 뒤 다시 조회할게요.
            </p>
          )}
        </>
      )}

      {orderId && (
        <div className="rounded-2xl bg-n-900 p-5">
          {order.isPending ? (
            <p>주문을 확인하고 있어요.</p>
          ) : (
            order.data && (
              <>
                <h2 className="font-semibold">{order.data.productName}</h2>

                <p className="mt-2">
                  {order.data.price.toLocaleString('ko-KR')}원 · {order.data.credits} 토큰
                </p>

                <p role="status" className="mt-4 text-sm">
                  {orderLabels[order.data.state]}
                </p>

                {order.data.state === 'PAID' && !order.data.creditGranted && (
                  <p className="mt-2 text-sm">토큰 지급을 확인하고 있어요.</p>
                )}

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block h-11 rounded-xl bg-p-500 px-4 py-3 text-center text-[14px] font-semibold"
                  >
                    결제창 열기
                  </a>
                )}

                {url && (
                  <p className="mt-2 text-xs text-b-400">
                    결제를 마치면 이 화면으로 돌아와 주세요.
                  </p>
                )}
              </>
            )
          )}
        </div>
      )}

      {(message || queryError) && (
        <p role="alert" className="text-sm">
          {message || errorMessage(queryError)}
        </p>
      )}

      {(orderId || pendingRequest) && (
        <SecondaryButton
          disabled={busy}
          onClick={() => {
            if (orderId) {
              void order.refetch();
            } else {
              void recoveredOrder.refetch();
            }

            void balance.refetch();
          }}
        >
          다시 확인
        </SecondaryButton>
      )}

      {clearable && (
        <SecondaryButton disabled={busy} onClick={clearTerminalOrder}>
          {paid ? '추가 충전하기' : '다른 충전 상품 선택'}
        </SecondaryButton>
      )}

      {paid && showGenerateButton && (
        <>
          <PrimaryButton
            disabled={
              busy ||
              !canGenerate ||
              balance.data?.available === undefined ||
              balance.data.available < cost
            }
            onClick={() => void continueGeneration()}
          >
            토큰 사용하고 이미지 생성
            <TokenCost amount={cost} />
          </PrimaryButton>
        </>
      )}

      {selectedProduct && (
        <FlowModal
          title="결제 정보를 입력해 주세요"
          onClose={() => setSelectedProduct(null)}
          animate
        >
          <label className="block text-left text-[14px] text-b-400">
            결제용 휴대폰 번호
            <input
              aria-label="결제용 휴대폰 번호"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              pattern="01[016789][0-9]{7,8}"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={busy}
              placeholder="01012345678"
              className="mt-2 h-[52px] w-full rounded-2xl border-0 bg-n-900 px-5 text-b-200 outline-none placeholder:text-b-600 focus:ring-2 focus:ring-p-300"
            />
          </label>
          <p className="mt-4 text-center text-sm">
            {selectedProduct.credits} 토큰 · {selectedProduct.price.toLocaleString('ko-KR')}원
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <PrimaryButton disabled={busy} onClick={() => void create(selectedProduct)}>
              결제 진행
            </PrimaryButton>
            <SecondaryButton disabled={busy} onClick={() => setSelectedProduct(null)}>
              취소
            </SecondaryButton>
          </div>
        </FlowModal>
      )}
    </section>
  );
}
