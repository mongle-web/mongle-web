import type { Balance, DreamImageResult } from '../api/dreamRecordApi';

export const INITIAL_IMAGE_COST = 3;

export function getImageCost(previous: DreamImageResult | null) {
  const hasSuccessfulResult =
    previous?.status === 'COMPLETED' || previous?.hasPreviousResult === true;

  return hasSuccessfulResult ? previous.nextRegenerationCost : INITIAL_IMAGE_COST;
}

export function canAffordImage(balance: Balance, cost: number) {
  return !balance.spendingBlocked && balance.available >= cost;
}
