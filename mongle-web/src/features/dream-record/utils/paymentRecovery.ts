export const PAYMENT_RECOVERY_AUTO_MS = 2 * 60 * 1000;

export interface PendingPaymentRequest {
  version: 1;
  requestId: string;
  productId: string;
  createdAt: number;
}

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BUYER_PHONE_PATTERN = /^01[016789][0-9]{7,8}$/;

export function normalizeBuyerPhone(value: string) {
  return value.replace(/\D/g, '');
}

export function isValidBuyerPhone(value: string) {
  return BUYER_PHONE_PATTERN.test(value);
}

export function createPendingPaymentRequest(input: {
  requestId: string;
  productId: string;
  createdAt?: number;
}): PendingPaymentRequest {
  return {
    version: 1,
    requestId: input.requestId,
    productId: input.productId,
    createdAt: input.createdAt ?? Date.now(),
  };
}

export function parsePendingPaymentRequest(value: string | null): PendingPaymentRequest | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PendingPaymentRequest>;

    if (
      typeof parsed.requestId !== 'string' ||
      !REQUEST_ID_PATTERN.test(parsed.requestId) ||
      typeof parsed.productId !== 'string' ||
      !parsed.productId.trim() ||
      (parsed.createdAt !== undefined &&
        (!Number.isFinite(parsed.createdAt) || parsed.createdAt < 0))
    ) {
      return null;
    }

    return {
      version: 1,
      requestId: parsed.requestId,
      productId: parsed.productId,
      // 이전 구현이 저장한 레코드에는 시각이 없다. 이런 주문도 requestId로 복구하되
      // 자동 조회 만료를 적용하지 않는다.
      createdAt: parsed.createdAt ?? 0,
    };
  } catch {
    return null;
  }
}

export function isPaymentRecoveryExpired(pending: PendingPaymentRequest, now = Date.now()) {
  return pending.createdAt > 0 && now - pending.createdAt >= PAYMENT_RECOVERY_AUTO_MS;
}
