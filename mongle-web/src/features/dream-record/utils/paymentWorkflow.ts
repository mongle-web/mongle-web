import type { Balance } from '../api/dreamRecordApi';
import type { PaymentOrder } from '../api/dreamPaymentApi';
import { evaluatePaymentResume } from './paymentState';

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

  if (evaluatePaymentResume(order, null, cost) === 'waiting') {
    return { kind: 'waiting', order };
  }

  const balance = await api.balance();

  if (evaluatePaymentResume(order, balance, cost) === 'insufficient') {
    return { kind: 'insufficient', order, balance };
  }

  return { kind: 'ready', order, balance };
}
