import { useRef, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';

import { dreamRecordApi, errorMessage } from '../api/dreamRecordApi';

import {
  dreamPaymentApi,
  isPaymentComplete,
  paymentLink,
  type CreditProduct,
  type PaymentOrder,
} from '../api/dreamPaymentApi';

interface Props {
  dreamId: number;
  cost: number;
  canGenerate: boolean;
  onContinue: () => void;
  onBack: () => void;
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
};

export default function DreamCharge({ dreamId, cost, canGenerate, onContinue, onBack }: Props) {
  const [params, setParams] = useSearchParams();

  const orderId = params.get('orderId');
  const key = `mongle:payment-pending:${dreamId}`;

  const [pendingRequest, setPendingRequest] = useState(() => {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  });

  const [phone, setPhone] = useState('');
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
      query.state.error ||
      !query.state.data ||
      isPaymentComplete(query.state.data) ||
      ['CANCELLED', 'REQUEST_REJECTED'].includes(query.state.data.state)
        ? false
        : 3000,
  });

  const history = useQuery({
    queryKey: ['dream-payments', 'recent'],
    queryFn: ({ signal }) => dreamPaymentApi.orders(signal),
    enabled: pendingRequest && !orderId,
    retry: false,
  });

  const paid = isPaymentComplete(order.data);

  const balance = useQuery({
    queryKey: ['dream-payments', 'balance', orderId, paid],
    queryFn: ({ signal }) => dreamRecordApi.balance(signal),
    retry: false,
  });

  const url = paymentLink(order.data);

  const terminal = order.data && ['CANCELLED', 'REQUEST_REJECTED'].includes(order.data.state);

  const queryError = products.error || order.error || balance.error || history.error;

  function chooseOrder(value: PaymentOrder) {
    queryClient.setQueryData(['dream-payments', 'order', value.orderId], value);

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
    if (lock.current || pendingRequest || orderId) {
      return;
    }

    const buyerPhone = phone.replace(/\D/g, '');

    if (!/^01[016789][0-9]{7,8}$/.test(buyerPhone)) {
      setMessage('휴대폰 번호를 정확히 입력해 주세요.');
      return;
    }

    lock.current = true;
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

      setPendingRequest(true);

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

        setPendingRequest(false);
        setMessage(errorMessage(error));
      } else {
        setMessage(
          `${errorMessage(error)} 같은 주문 식별자를 유지하고 아래 주문 내역에서 먼저 확인해 주세요.`,
        );

        await history.refetch();
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function clearTerminalOrder() {
    if (!terminal && !paid) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // 서버에서 확인한 주문 상태를 기준으로 처리한다.
    }

    setPendingRequest(false);

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
    if (lock.current || !canGenerate || !orderId) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setMessage('');

    try {
      const latest = await dreamPaymentApi.order(orderId);

      queryClient.setQueryData(['dream-payments', 'order', orderId], latest);

      if (!isPaymentComplete(latest)) {
        throw new Error('결제와 토큰 지급이 아직 확인되지 않았어요.');
      }

      const latestBalance = await dreamRecordApi.balance();

      queryClient.setQueryData(['dream-record', 'balance'], latestBalance);

      if (latestBalance.spendingBlocked || latestBalance.available < cost) {
        throw new Error('이미지 생성에 사용할 수 있는 토큰이 부족하거나 결제 확인 중이에요.');
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
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex h-[52px] items-center justify-between rounded-2xl bg-n-900 px-5">
        <span className="text-[14px] text-b-600">보유 토큰</span>
        <strong className="text-[14px] font-semibold">{balance.data?.available ?? '—'}개</strong>
      </div>

      {!orderId && !pendingRequest && (
        <>
          <label className="text-[14px] text-b-400">
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

          {products.isPending && <p role="status">충전 상품을 불러오고 있어요.</p>}

          {products.data?.length === 0 && <p>현재 구매할 수 있는 충전 상품이 없어요.</p>}

          {!!products.data?.length && (
            <div className="flex flex-col rounded-2xl bg-n-900 px-5 py-2">
              {products.data.map((product) => (
                <div
                  key={product.productId}
                  className="flex min-h-[58px] items-center justify-between gap-4"
                >
                  <p className="text-[14px] font-medium" title={product.name}>
                    {product.credits} 토큰
                  </p>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void create(product)}
                    className="h-9 min-w-[100px] rounded-full bg-p-500 px-5 text-[14px] font-semibold disabled:opacity-40"
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
          <p role="status">
            주문 접수 결과를 확인하고 있어요. 방금 요청한 상품과 시간을 확인해 주문을 선택해 주세요.
          </p>

          {history.data?.items.map((item) => (
            <button
              key={item.orderId}
              type="button"
              onClick={() => chooseOrder(item)}
              className="rounded-2xl bg-n-900 p-4 text-left"
            >
              <span className="block">
                {item.productName} · {item.price.toLocaleString('ko-KR')}원
              </span>

              <span className="mt-1 block text-xs">
                {new Date(item.createdAt).toLocaleString('ko-KR')} · {orderLabels[item.state]}
              </span>
            </button>
          ))}

          {history.data?.items.length === 0 && (
            <p className="text-sm">
              조회된 주문이 없어요. 새 주문을 만들기 전에 잠시 후 다시 확인해 주세요.
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

      <SecondaryButton
        disabled={busy}
        onClick={() => {
          if (orderId) {
            void order.refetch();
          } else if (pendingRequest) {
            void history.refetch();
          } else {
            void products.refetch();
          }

          void balance.refetch();
        }}
      >
        상태 다시 확인
      </SecondaryButton>

      {(terminal || paid) && (
        <SecondaryButton disabled={busy} onClick={clearTerminalOrder}>
          {paid ? '추가 충전하기' : '다른 충전 상품 선택'}
        </SecondaryButton>
      )}

      {paid && (
        <>
          <p className="text-sm">
            충전이 완료됐어요. 토큰을 사용해 선택한 화풍으로 그림을 만들 수 있어요.
          </p>

          {!canGenerate && (
            <p className="text-sm text-b-400">화풍 선택과 꿈 분석 완료를 확인해 주세요.</p>
          )}

          <PrimaryButton disabled={busy || !canGenerate} onClick={() => void continueGeneration()}>
            토큰 사용하고 이미지 생성
            <TokenCost amount={cost} />
          </PrimaryButton>
        </>
      )}

      <SecondaryButton disabled={busy} onClick={onBack}>
        그림 생성 화면으로 돌아가기
      </SecondaryButton>
    </section>
  );
}
