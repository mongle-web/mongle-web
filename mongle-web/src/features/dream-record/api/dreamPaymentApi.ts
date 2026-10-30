import { apiClient } from '@/api/client';
import { RecordApiError } from './dreamRecordApi';
import { isPaymentComplete, paymentLink } from '../utils/paymentState';

export interface CreditProduct {
  productId: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
}

export interface PaymentOrder {
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  currency: string;
  credits: number;
  state:
    | 'REQUESTING'
    | 'READY'
    | 'REQUEST_REJECTED'
    | 'UNKNOWN'
    | 'PENDING'
    | 'PAID'
    | 'CANCELLED'
    | 'PAYMENT_REVIEW';
  paymentUrl: string | null;
  creditGranted: boolean;
  createdAt: string;
}

export interface OrderRequest {
  requestId: string;
  productId: string;
  buyerPhone: string;
}

interface Response<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

async function request<T>(
  method: 'get' | 'post',
  url: string,
  data?: unknown,
  signal?: AbortSignal,
) {
  const response = await apiClient.request<Response<T>>({
    method,
    url,
    data,
    signal,
  });

  if (!response.data.success) {
    throw new RecordApiError(response.data.code, response.data.message);
  }

  return response.data.data;
}

export { isPaymentComplete, paymentLink };

export const dreamPaymentApi = {
  products: (signal?: AbortSignal) =>
    request<CreditProduct[]>('get', '/api/v1/payments/products', undefined, signal),

  create: (body: OrderRequest) => request<PaymentOrder>('post', '/api/v1/payments/orders', body),

  order: (id: string, signal?: AbortSignal) =>
    request<PaymentOrder>(
      'get',
      `/api/v1/payments/orders/${encodeURIComponent(id)}`,
      undefined,
      signal,
    ),

  orders: (signal?: AbortSignal) =>
    request<{ items: PaymentOrder[]; hasNext: boolean }>(
      'get',
      '/api/v1/payments/orders?size=20',
      undefined,
      signal,
    ),
};
