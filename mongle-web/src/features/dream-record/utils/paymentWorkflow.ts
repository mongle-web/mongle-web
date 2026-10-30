import type { Balance } from '../api/dreamRecordApi';
import type { PaymentOrder } from '../api/dreamPaymentApi';
import { isPaymentComplete } from './paymentState';

export type PaymentResumeResult =
  | { kind: 'waiting'; order: PaymentOrder }
  | { kind: 'insufficient'; order: PaymentOrder; balance: Balance }
  | { kind: 'ready'; order: PaymentOrder; balance: Balance };

export async function confirmPaymentForImage(
  orderId: string,
  cost: number,
  api: {
    order: (id: string) => Promise<PaymentOrder>;
    balance: () => Promise<Balance>;
  },
): Promise<PaymentResumeResult> {
  const order = await api.order(orderId);

  if (!isPaymentComplete(order)) {
    return { kind: 'waiting', order };
  }

  const balance = await api.balance();

  if (balance.spendingBlocked || balance.available < cost) {
    return { kind: 'insufficient', order, balance };
  }

  return { kind: 'ready', order, balance };
}
