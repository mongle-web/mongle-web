export const EMOTIONS = ['행복', '편안함', '설렘', '슬픔', '불안', '화남', '당황'] as const;

export type Emotion = (typeof EMOTIONS)[number];

export type RecordStep = 'text' | 'emotion' | 'image' | 'complete';

export const MAX_LENGTH = 500;
export const MAX_EMOTIONS = 3;

const LEGACY_KEY = 'mongle:dream-record-draft';

export interface DreamDraft {
  date: string;
  content: string;
  emotions: Emotion[];
  imageRequested: boolean;
  step: Exclude<RecordStep, 'complete'>;
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseRecordDate(value: unknown, today = new Date()): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // 2월 31일 같은 잘못된 날짜와 미래 날짜를 차단한다.
  if (toDateString(date) !== value || value > toDateString(today)) {
    return null;
  }

  return date;
}

function isEmotion(value: unknown): value is Emotion {
  return EMOTIONS.some((emotion) => emotion === value);
}

export function normalizeDraft(value: unknown, date: string): DreamDraft | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Record<string, unknown>;

  if (raw.date !== date || !parseRecordDate(raw.date) || typeof raw.content !== 'string') {
    return null;
  }

  const content = raw.content.slice(0, MAX_LENGTH);

  // 이전 버전의 emotion 단일 값도 복원한다.
  const source = Array.isArray(raw.emotions)
    ? raw.emotions
    : isEmotion(raw.emotion)
      ? [raw.emotion]
      : [];

  const emotions = [...new Set(source.filter(isEmotion))].slice(0, MAX_EMOTIONS);

  const step = !content.trim()
    ? 'text'
    : emotions.length === 0 && raw.step === 'image'
      ? 'emotion'
      : raw.step === 'emotion' || raw.step === 'image'
        ? raw.step
        : 'text';

  return {
    date,
    content,
    emotions,
    step,
    imageRequested: raw.imageRequested === true,
  };
}

export function readDraft(date: string): {
  draft: DreamDraft;
  warning: string;
} {
  const empty: DreamDraft = {
    date,
    content: '',
    emotions: [],
    step: 'text',
    imageRequested: false,
  };

  try {
    const stored = sessionStorage.getItem(`${LEGACY_KEY}:${date}`);
    const legacy = stored === null ? sessionStorage.getItem(LEGACY_KEY) : null;
    const raw = stored ?? legacy;

    if (!raw) {
      return {
        draft: empty,
        warning: '',
      };
    }

    const draft = normalizeDraft(JSON.parse(raw), date);

    return {
      draft: draft ?? empty,
      warning: stored && !draft ? '임시 기록을 복원하지 못했어요. 새로 작성해 주세요.' : '',
    };
  } catch {
    return {
      draft: empty,
      warning: '임시 기록을 불러오지 못했어요. 이 화면에서 계속 작성할 수 있어요.',
    };
  }
}

export function writeDraft(draft: DreamDraft): boolean {
  try {
    sessionStorage.setItem(`${LEGACY_KEY}:${draft.date}`, JSON.stringify(draft));

    return true;
  } catch {
    return false;
  }
}
