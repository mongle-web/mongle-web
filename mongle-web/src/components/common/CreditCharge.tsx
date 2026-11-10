import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

// TODO: 결제 · 잔액 API와 결제 유틸을 공통 위치(src/api)로 옮길지 꿈 기록 담당과 협의 (지금은 꿈 기록 쪽 그대로 사용)
import { dreamRecordApi, errorMessage } from '@/features/dream-record/api/dreamRecordApi';

import {
  dreamPaymentApi,
  isPaymentComplete,
  paymentLink,
  type CreditProduct,
  type PaymentOrder,
} from '@/features/dream-record/api/dreamPaymentApi';
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
  CREDIT_RECLAIMED: '결제가 취소되어 지급된 토큰이 회수되었어요.',
  REFUND_SETTLED: '환불이 완료되었어요.',
};

// 자동 조회를 멈추는 주문 상태 (더 기다려도 바뀌지 않거나 별도 확인이 필요한 상태)
const stoppedStates: PaymentOrder['state'][] = [
  'CANCELLED',
  'REQUEST_REJECTED',
  'PAYMENT_REVIEW',
  'CREDIT_RECLAIMED',
  'REFUND_SETTLED',
];

// 끝난 주문이라 다른 상품을 다시 고를 수 있는 상태
const terminalStates: PaymentOrder['state'][] = [
  'CANCELLED',
  'REQUEST_REJECTED',
  'CREDIT_RECLAIMED',
  'REFUND_SETTLED',
];

// 자동 조회 간격과 최대 시간 (이후에는 "다시 확인" 버튼으로 수동 조회)
const POLL_INTERVAL_MS = 3000;
const POLL_LIMIT_MS = 60_000;

// 주문 생성 실패 코드별 안내 (스웨거 POST /api/v1/payments/orders)
const paymentErrorMessages: Record<string, string> = {
  PAYMENT_409_1: '지금은 이 상품을 구매할 수 없어요.',
  PAYMENT_409_2: '이미 다른 내용으로 요청된 주문이에요.',
  PAYMENT_409_3: '진행 중인 결제와 충돌했어요.',
  CREDIT_409_5: '확인 중인 결제가 있어요. 확인이 끝난 뒤 다시 시도해 주세요.',
  PAYMENT_503_1: '지금은 결제를 준비 중이에요. 잠시 후 다시 시도해 주세요.',
  PAYMENT_503_2: '결제 요청이 많아요.',
};

// 서버가 주문을 만들지 않고 거절한 코드 (요청 흔적을 지우고 다시 고를 수 있게 함)
const rejectedCodes = ['PAYMENT_409_1', 'CREDIT_409_5', 'PAYMENT_503_1'];

function isNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

function paymentErrorCode(error: unknown): string | undefined {
  return axios.isAxiosError(error) ? error.response?.data?.code : undefined;
}

function paymentErrorMessage(error: unknown) {
  return paymentErrorMessages[paymentErrorCode(error) ?? ''] ?? errorMessage(error);
}

// sessionStorage에 남긴 주문 생성 요청의 requestId
function readPendingRequestId(key: string) {
  try {
    const saved = sessionStorage.getItem(key);

    if (!saved) {
      return null;
    }

    const { requestId } = JSON.parse(saved) as { requestId?: unknown };

    return typeof requestId === 'string' ? requestId : null;
  } catch {
    return null;
  }
}

// key가 같은 상태로 limit만큼 지나면 true (key가 바뀌면 다시 셈)
function usePollingExpired(key: string | null, limit: number) {
  const [expiredKey, setExpiredKey] = useState<string | null>(null);

  useEffect(() => {
    if (!key) {
      return;
    }

    const timer = window.setTimeout(() => setExpiredKey(key), limit);

    return () => window.clearTimeout(timer);
  }, [key, limit]);

  return key !== null && expiredKey === key;
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

  // 응답을 놓쳤을 수 있는 주문 생성 요청의 requestId (결과를 확인할 때까지 유지)
  const [pendingRequestId, setPendingRequestId] = useState(() => readPendingRequestId(key));
  const pendingRequest = pendingRequestId !== null;

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
      orderPollingExpired ||
      query.state.error ||
      !query.state.data ||
      isPaymentComplete(query.state.data) ||
      stoppedStates.includes(query.state.data.state)
        ? false
        : POLL_INTERVAL_MS,
  });

  // 같은 주문 상태로 1분이 지나면 자동 조회를 멈추고 수동 조회로 전환 (상태가 바뀌면 다시 자동 조회)
  const orderPollingExpired = usePollingExpired(
    order.data ? `${order.data.orderId}:${order.data.state}:${order.data.creditGranted}` : null,
    POLL_LIMIT_MS,
  );

  // 주문 생성 응답을 놓친 경우 같은 requestId로 주문을 찾는다 (새 주문 · 재결제는 하지 않음)
  // 생성 중에는 잠깐 404일 수 있어 한 번의 404로 requestId를 버리지 않는다
  const recovery = useQuery({
    queryKey: ['dream-payments', 'by-request-id', pendingRequestId],
    queryFn: ({ signal }) => dreamPaymentApi.byRequestId(pendingRequestId!, signal),
    enabled: pendingRequest && !orderId && !busy,
    retry: false,
    refetchInterval: (query) =>
      !recoveryPollingExpired && !query.state.data && isNotFound(query.state.error)
        ? POLL_INTERVAL_MS
        : false,
  });

  // 1분 동안 찾지 못하면 자동 조회를 멈추고 수동 조회 · 다시 선택을 안내
  const recoveryPollingExpired = usePollingExpired(
    pendingRequest && !orderId && !busy ? pendingRequestId : null,
    POLL_LIMIT_MS,
  );

  const recoveryMissing = recoveryPollingExpired && !recovery.data && isNotFound(recovery.error);

  useEffect(() => {
    if (recovery.data && !orderId) {
      chooseOrder(recovery.data);
    }
  });

  const paid = isPaymentComplete(order.data);

  const balance = useQuery({
    queryKey: ['dream-payments', 'balance', orderId, paid],
    queryFn: ({ signal }) => dreamRecordApi.balance(signal),
    retry: false,
  });

  const url = paymentLink(order.data);

  const terminal = order.data && terminalStates.includes(order.data.state);

  // 복구 조회 404는 주문 생성 중일 수 있어 오류로 보여주지 않는다
  const queryError =
    products.error ||
    order.error ||
    balance.error ||
    (isNotFound(recovery.error) ? null : recovery.error);

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

    const buyerPhone = phone.replace(/\D/g, '');

    if (!/^01[016789][0-9]{7,8}$/.test(buyerPhone)) {
      setMessage('휴대폰 번호를 정확히 입력해 주세요.');
      return;
    }

    await runWithRequestLock(lock, async () => {
      setBusy(true);
      setMessage('');

      try {
        const requestId = crypto.randomUUID();

        // 응답을 놓친 주문을 자동으로 다시 만들지 않도록 요청 흔적을 남긴다.
        // 휴대폰 번호와 결제 URL은 저장하지 않는다.
        try {
          sessionStorage.setItem(
            key,
            JSON.stringify({
              requestId,
              productId: product.productId,
            }),
          );
        } catch {
          setMessage('주문 식별자를 안전하게 보관할 수 없어 결제를 시작하지 않았어요.');
          return;
        }

        setPendingRequestId(requestId);

        const result = await dreamPaymentApi.create({
          requestId,
          productId: product.productId,
          buyerPhone,
        });

        chooseOrder(result);
      } catch (error) {
        const rejected =
          (axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0)) ||
          rejectedCodes.includes(paymentErrorCode(error) ?? '');

        if (rejected) {
          try {
            sessionStorage.removeItem(key);
          } catch {
            // 서버가 거절한 요청은 화면에서 다시 선택할 수 있게 한다.
          }

          setPendingRequestId(null);
          setMessage(paymentErrorMessage(error));
        } else {
          // 주문이 만들어졌을 수 있으므로 같은 requestId로 복구 조회한다 (busy가 풀리면 자동 시작)
          setMessage(
            `${paymentErrorMessage(error)} 새로 결제하지 말고 결제 요청 확인을 기다려 주세요.`,
          );
        }
      } finally {
        setBusy(false);
      }
    });
  }

  function clearTerminalOrder() {
    if (!terminal && !paid && !recoveryMissing) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // 서버에서 확인한 주문 상태를 기준으로 처리한다.
    }

    setPendingRequestId(null);

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

      {pendingRequest && !orderId && (
        <>
          <p role="status" className="text-sm text-b-400">
            {recoveryMissing
              ? '결제 요청을 찾지 못했어요. 다시 확인하거나, 결제창을 열지 않았다면 다른 상품을 선택해 주세요.'
              : '결제 요청을 확인하고 있어요.'}
          </p>
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

                {orderPollingExpired && !paid && !stoppedStates.includes(order.data.state) && (
                  <p className="mt-2 text-sm text-b-400">
                    확인이 늦어지고 있어요. 잠시 후 다시 확인을 눌러 주세요.
                  </p>
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
              void recovery.refetch();
            }

            void balance.refetch();
          }}
        >
          다시 확인
        </SecondaryButton>
      )}

      {(terminal || paid || (recoveryMissing && !orderId)) && (
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
              autoComplete="tel"
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
