import axios from 'axios';
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
    | 'PAYMENT_REVIEW'
    | 'CREDIT_RECLAIMED';
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

const paymentErrorMessages: Record<string, string> = {
  PAYMENT_400_1: '주문 요청 식별자 형식을 확인해 주세요.',
  PAYMENT_400_2: '주문 조회 조건을 확인해 주세요.',
  PAYMENT_404_1: '주문을 아직 찾지 못했어요. 같은 주문 식별자로 다시 확인해 주세요.',
  PAYMENT_409_1: '현재 판매할 수 없는 충전 상품이에요.',
  PAYMENT_409_2: '같은 주문 식별자에 다른 결제 정보가 사용되었어요.',
  PAYMENT_409_3: '결제 거래 상태가 충돌해 확인이 필요해요.',
  CREDIT_409_5: '결제 취소 확인 중이라 새 결제를 진행할 수 없어요.',
  PAYMENT_503_1: '결제 서버 설정이 아직 준비되지 않았어요.',
  PAYMENT_503_2: '동시에 처리 중인 결제 요청이 많아요. 잠시 뒤 상태를 다시 확인해 주세요.',
};

export function paymentErrorCode(error: unknown) {
  if (error instanceof RecordApiError) {
    return error.code;
  }

  if (!axios.isAxiosError(error)) {
    return '';
  }

  return String(error.response?.data?.code ?? '');
}

export function paymentErrorMessage(error: unknown) {
  const code = paymentErrorCode(error);

  if (paymentErrorMessages[code]) {
    return paymentErrorMessages[code];
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return '로그인이 필요하거나 만료되었어요. 다시 로그인해 주세요.';
    }

    if (error.response?.status === 403) {
      return '닉네임 온보딩을 완료한 뒤 다시 시도해 주세요.';
    }

    if (!error.response) {
      return '서버 응답을 확인하지 못했어요. 주문을 새로 만들지 말고 상태를 다시 조회해 주세요.';
    }

    return error.response.data?.message || '결제 요청을 처리하지 못했어요.';
  }

  return error instanceof Error ? error.message : '결제 요청을 처리하지 못했어요.';
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

  byRequestId: (requestId: string, signal?: AbortSignal) =>
    request<PaymentOrder>(
      'get',
      `/api/v1/payments/orders/by-request-id/${encodeURIComponent(requestId)}`,
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
