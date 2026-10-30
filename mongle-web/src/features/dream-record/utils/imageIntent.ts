export type DreamImageView = 'style' | 'offer' | 'charge';

export interface DreamImageIntent {
  dreamId: number;
  style: string;
  view: DreamImageView;
  action?: 'create' | 'regenerate';
  imageVersion?: number;
}

const KEY_PREFIX = 'mongle:dream-image-intent:';

function key(dreamId: number) {
  return `${KEY_PREFIX}${dreamId}`;
}

export function readImageIntent(dreamId: number): DreamImageIntent | null {
  try {
    const value = sessionStorage.getItem(key(dreamId));

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as Partial<DreamImageIntent>;

    if (
      parsed.dreamId !== dreamId ||
      typeof parsed.style !== 'string' ||
      parsed.style.length > 50 ||
      !['style', 'offer', 'charge'].includes(parsed.view ?? '') ||
      (parsed.action !== undefined && !['create', 'regenerate'].includes(parsed.action)) ||
      (parsed.imageVersion !== undefined && (!Number.isInteger(parsed.imageVersion) || parsed.imageVersion < 0))
    ) {
      return null;
    }

    return parsed as DreamImageIntent;
  } catch {
    return null;
  }
}

export function writeImageIntent(intent: DreamImageIntent) {
  try {
    sessionStorage.setItem(key(intent.dreamId), JSON.stringify(intent));
  } catch {
    // 서버의 꿈 ID와 화면 상태가 기준이며, 저장소 사용 불가가 API 호출을 유발하면 안 된다.
  }
}

export function clearImageIntent(dreamId: number) {
  try {
    sessionStorage.removeItem(key(dreamId));
  } catch {
    // 완료 이후 복구 정보 정리는 최선형으로 처리한다.
  }
}
