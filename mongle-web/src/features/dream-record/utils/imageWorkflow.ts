import { type Balance, type Dream, type DreamImageResult } from '../api/dreamRecordApi';
import { canAffordImage, getImageCost, INITIAL_IMAGE_COST } from './imageCost';

type ImageWorkflowResult =
  | { kind: 'running' | 'existing'; image: DreamImageResult }
  | { kind: 'insufficient'; image: DreamImageResult | null; cost: number }
  | { kind: 'started'; image: DreamImageResult; cost: number }
  | { kind: 'blocked'; image: DreamImageResult | null };

interface ImageWorkflowDependencies {
  fetchImage: () => Promise<DreamImageResult | null>;
  fetchBalance: () => Promise<Balance>;
  fetchDream: () => Promise<Dream>;
  generate: (
    dream: Dream,
    style: string,
    previous: DreamImageResult | null,
  ) => Promise<DreamImageResult>;
  style: string;
  errorCode: (error: unknown) => string | null;
  allowRegeneration: boolean;
  onImage: (image: DreamImageResult | null) => void;
  onBalance: (balance: Balance) => void;
  onStart: () => void;
}

export async function runImageWorkflow(
  deps: ImageWorkflowDependencies,
): Promise<ImageWorkflowResult> {
  const existing = await deps.fetchImage();
  deps.onImage(existing);

  if (existing?.status === 'PENDING' || existing?.status === 'PROCESSING') {
    return { kind: 'running', image: existing };
  }

  const hasPrevious = existing?.status === 'COMPLETED' || existing?.hasPreviousResult === true;

  if (hasPrevious && existing?.status === 'COMPLETED' && !deps.allowRegeneration) {
    return { kind: 'existing', image: existing };
  }

  const balance = await deps.fetchBalance();
  deps.onBalance(balance);

  if (balance.spendingBlocked) {
    return { kind: 'blocked', image: existing };
  }

  const cost = hasPrevious ? getImageCost(existing) : INITIAL_IMAGE_COST;

  if (cost === null) {
    throw new Error('재생성 비용을 확인할 수 없어요. 잠시 후 다시 조회해 주세요.');
  }

  if (!canAffordImage(balance, cost)) {
    return { kind: 'insufficient', image: existing, cost };
  }

  const dream = await deps.fetchDream();
  deps.onStart();

  try {
    const image = await deps.generate(dream, deps.style, existing);
    deps.onImage(image);
    return { kind: 'started', image, cost };
  } catch (error) {
    const code = deps.errorCode(error);

    if (code === 'CREDIT_409_1') {
      return { kind: 'insufficient', image: existing, cost };
    }

    if (code === 'CREDIT_409_5') {
      throw error;
    }

    // A timeout or dropped response is reconciled with GET before the caller
    // can offer another POST. Never retry a billable request automatically.
    const reconciled = await deps.fetchImage();
    deps.onImage(reconciled);

    if (reconciled && ['PENDING', 'PROCESSING', 'COMPLETED'].includes(reconciled.status)) {
      return { kind: 'running', image: reconciled };
    }

    throw error;
  }
}
