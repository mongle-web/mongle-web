import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPendingPaymentRequest,
  isPaymentRecoveryExpired,
  isValidBuyerPhone,
  normalizeBuyerPhone,
  parsePendingPaymentRequest,
} from '../src/features/dream-record/utils/paymentRecovery.ts';
import {
  canClearPaymentOrder,
  evaluatePaymentResume,
  isPaymentComplete,
  isPaymentPollingStopped,
  paymentLink,
  paymentPhase,
} from '../src/features/dream-record/utils/paymentState.ts';
import { runWithRequestLock } from '../src/features/dream-record/utils/requestLock.ts';

const requestId = '123e4567-e89b-42d3-a456-426614174000';

function order(overrides = {}) {
  return {
    orderId: 'order-101',
    productId: 'credit-10',
    productName: '몽글 토큰 10개',
    price: 1000,
    currency: 'KRW',
    credits: 10,
    state: 'READY',
    paymentUrl: 'https://payapp.kr/pay/order-101',
    creditGranted: false,
    createdAt: '2026-11-06T12:00:00Z',
    ...overrides,
  };
}

test('상품 선택부터 복귀·지급·잔액 확인까지 모의 응답으로 복구한다', async () => {
  const calls = [];
  const api = {
    async products() {
      calls.push('products');
      return [
        {
          productId: 'credit-10',
          name: '몽글 토큰 10개',
          price: 1000,
          currency: 'KRW',
          credits: 10,
        },
      ];
    },
    async create(body) {
      calls.push(['create', body]);
      return order();
    },
    async byRequestId(value) {
      calls.push(['byRequestId', value]);
      return order({ state: 'PAID', paymentUrl: null, creditGranted: false });
    },
    async order() {
      calls.push('order');
      return order({ state: 'PAID', paymentUrl: null, creditGranted: true });
    },
    async balance() {
      calls.push('balance');
      return { available: 10, reserved: 0, total: 10, spendingBlocked: false };
    },
  };

  const [product] = await api.products();
  const buyerPhone = normalizeBuyerPhone('010-1234-5678');
  assert.equal(isValidBuyerPhone(buyerPhone), true);

  const pending = createPendingPaymentRequest({
    requestId,
    productId: product.productId,
    createdAt: 1_000,
  });
  assert.deepEqual(parsePendingPaymentRequest(JSON.stringify(pending)), pending);

  const created = await api.create({
    requestId: pending.requestId,
    productId: pending.productId,
    buyerPhone,
  });
  assert.equal(paymentPhase(created), 'ready');
  assert.equal(paymentLink(created), 'https://payapp.kr/pay/order-101');

  const returned = await api.byRequestId(pending.requestId);
  assert.equal(paymentPhase(returned), 'crediting');
  assert.equal(isPaymentComplete(returned), false);
  assert.equal(evaluatePaymentResume(returned, null, 3), 'waiting');

  const paid = await api.order(created.orderId);
  assert.equal(evaluatePaymentResume(paid, null, 3), 'balance-required');

  const balance = await api.balance();
  assert.equal(evaluatePaymentResume(paid, balance, 3), 'ready');
  assert.deepEqual(calls, [
    'products',
    ['create', { requestId, productId: 'credit-10', buyerPhone: '01012345678' }],
    ['byRequestId', requestId],
    'order',
    'balance',
  ]);
});

test('완료 조건과 대기·취소·실패·검토·회수 상태를 구분한다', () => {
  const cases = [
    [order({ state: 'REQUESTING' }), 'requesting', false, false],
    [order({ state: 'PENDING' }), 'pending', false, false],
    [order({ state: 'PAID', creditGranted: false }), 'crediting', false, false],
    [order({ state: 'PAID', creditGranted: true }), 'complete', true, true],
    [order({ state: 'CANCELLED' }), 'cancelled', true, true],
    [order({ state: 'REQUEST_REJECTED' }), 'failed', true, true],
    [order({ state: 'PAYMENT_REVIEW' }), 'review', true, false],
    [order({ state: 'CREDIT_RECLAIMED' }), 'reclaimed', true, true],
    [order({ state: 'REFUND_SETTLED' }), 'refunded', true, true],
  ];

  for (const [value, phase, pollingStopped, clearable] of cases) {
    assert.equal(paymentPhase(value), phase);
    assert.equal(isPaymentPollingStopped(value), pollingStopped);
    assert.equal(canClearPaymentOrder(value), clearable);
  }
});

test('응답 유실 주문은 같은 requestId를 유지하고 자동 복구 만료 후에도 새 ID를 만들지 않는다', () => {
  const pending = createPendingPaymentRequest({
    requestId,
    productId: 'credit-10',
    createdAt: 1_000,
  });

  assert.equal(isPaymentRecoveryExpired(pending, 120_999), false);
  assert.equal(isPaymentRecoveryExpired(pending, 121_000), true);
  assert.equal(parsePendingPaymentRequest(JSON.stringify(pending))?.requestId, requestId);
});

test('결제 버튼 연타는 첫 주문 생성 요청만 실행한다', async () => {
  const lock = { current: false };
  let release;
  let calls = 0;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });

  const first = runWithRequestLock(lock, async () => {
    calls += 1;
    await waiting;
  });
  const second = await runWithRequestLock(lock, async () => {
    calls += 1;
  });

  assert.equal(second, false);
  assert.equal(calls, 1);
  release();
  assert.equal(await first, true);
});

test('비 HTTPS 결제 URL과 잘못된 휴대폰 번호를 거부한다', () => {
  assert.equal(paymentLink(order({ paymentUrl: 'http://payapp.kr/pay/order-101' })), null);
  assert.equal(paymentLink(order({ paymentUrl: 'javascript:alert(1)' })), null);
  assert.equal(isValidBuyerPhone('0212345678'), false);
});
