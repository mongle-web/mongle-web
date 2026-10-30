import type { PaymentOrder } from '../api/dreamPaymentApi';

export function isPaymentComplete(order: PaymentOrder | undefined) {
  return order?.state === 'PAID' && order.creditGranted;
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
