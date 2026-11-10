import type { PaymentOrder } from '../api/dreamPaymentApi';

export type PaymentPhase =
  | 'requesting'
  | 'ready'
  | 'failed'
  | 'unknown'
  | 'pending'
  | 'crediting'
  | 'complete'
  | 'cancelled'
  | 'review'
  | 'reclaimed'
  | 'refunded';

export function paymentPhase(order: PaymentOrder | undefined): PaymentPhase | null {
  if (!order) {
    return null;
  }

  if (order.state === 'PAID') {
    return order.creditGranted ? 'complete' : 'crediting';
  }

  const phases: Record<Exclude<PaymentOrder['state'], 'PAID'>, PaymentPhase> = {
    REQUESTING: 'requesting',
    READY: 'ready',
    REQUEST_REJECTED: 'failed',
    UNKNOWN: 'unknown',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    PAYMENT_REVIEW: 'review',
    CREDIT_RECLAIMED: 'reclaimed',
    REFUND_SETTLED: 'refunded',
  };

  return phases[order.state];
}

export function isPaymentComplete(order: PaymentOrder | undefined): boolean {
  return order?.state === 'PAID' && order.creditGranted;
}

export function isPaymentPollingStopped(order: PaymentOrder | undefined) {
  const phase = paymentPhase(order);

  return (
    phase === 'complete' ||
    phase === 'cancelled' ||
    phase === 'failed' ||
    phase === 'review' ||
    phase === 'reclaimed' ||
    phase === 'refunded'
  );
}

export function canClearPaymentOrder(order: PaymentOrder | undefined) {
  const phase = paymentPhase(order);

  return (
    phase === 'complete' ||
    phase === 'cancelled' ||
    phase === 'failed' ||
    phase === 'reclaimed' ||
    phase === 'refunded'
  );
}

export function paymentLink(order: PaymentOrder | undefined) {
  if (!order?.paymentUrl || !['READY', 'PENDING'].includes(order.state)) {
    return null;
  }

  try {
    const url = new URL(order.paymentUrl);

    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function evaluatePaymentResume(
  order: PaymentOrder,
  balance: { available: number; spendingBlocked: boolean } | null,
  cost: number,
) {
  if (!isPaymentComplete(order)) {
    return 'waiting' as const;
  }

  if (!balance) {
    return 'balance-required' as const;
  }

  if (balance.spendingBlocked || balance.available < cost) {
    return 'insufficient' as const;
  }

  return 'ready' as const;
}
