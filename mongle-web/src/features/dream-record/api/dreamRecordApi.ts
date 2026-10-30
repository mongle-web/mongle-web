
import axios from 'axios';
import { apiClient } from '@/api/client';
import { MAX_EMOTIONS, type Emotion } from '../utils/dreamDraft';

export const emotionCodes = {
  행복: 'HAPPY',
  편안함: 'CALM',
  설렘: 'EXCITED',
  슬픔: 'SAD',
  불안: 'ANXIOUS',
  화남: 'ANGRY',
  당황: 'CONFUSED',
} as const satisfies Record<Emotion, string>;

export type EmotionCode = (typeof emotionCodes)[Emotion];

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export const INITIAL_DREAM_IMAGE_COST = 3;

export interface Generation {
  dreamId: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  stage: 'ANALYSIS' | 'STORY';
  failureCode: string | null;
  sourceChanged: boolean;
  analysisId: number | null;
  storyId: number | null;
  generationVersion: number;
}

export interface Dream {
  dreamId: number;
  dreamedAt: string;
  originalText: string;
  emotions: EmotionCode[];
  title: string | null;
  displayKeywords: string[];
  revision: number;
  sourceRevision: number;
  recordStatus: 'DRAFT' | 'EMOTION_PENDING' | 'COMPLETED';
  analysisStatus: JobStatus | null;
  analysisSourceChanged: boolean;
  generation: Generation | null;
}

export interface DreamImageResult {
  imageId: number;
  dreamId: number;
  imageVersion: number;
  status: JobStatus;
  failureCode: string | null;
  hasPreviousResult: boolean;
  style: string;
  mood: string | null;
  sourceChanged: boolean;
  storyChanged: boolean;
  resultStyle: string | null;
  resultMood: string | null;
  contentType: string | null;
  width: number | null;
  height: number | null;
  freeRegenerationAvailable: boolean;
  nextRegenerationCost: number | null;
}

export interface AnalysisResult {
  analysisId: number;
  dreamId: number;
  sourceRevision: number;
  status: JobStatus;
  failureCode: string | null;
  sourceChanged: boolean;
  generatedTitle: string | null;
  displayKeywords: string[];
  scenes: {
    sequence: number;
    content: string;
  }[];
}

export interface StoryResult {
  storyId: number;
  dreamId: number;
  sourceRevision: number;
  storyVersion: number;
  status: JobStatus;
  failureCode: string | null;
  sourceChanged: boolean;
  hasPreviousResult: boolean;
  sections: {
    sequence: number;
    kind: 'SCENE' | 'AI_BRIDGE';
    content: string;
  }[];
}

export interface Balance {
  available: number;
  reserved: number;
  total: number;
  spendingBlocked: boolean;
}

export interface ImageOptions {
  styles: string[];
  moods: string[];
}

interface Envelope<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export class RecordApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch',
  url: string,
  data?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new RecordApiError(
      'CONFIG',
      'VITE_API_BASE_URL에 API 서버 주소를 설정해 주세요.',
    );
  }

  const response = await apiClient.request<Envelope<T>>({
    method,
    url,
    data,
    signal,
  });

  if (!response.data.success) {
    throw new RecordApiError(
      response.data.code,
      response.data.message,
    );
  }

  return response.data.data;
}

export function errorCode(error: unknown): string {
  if (error instanceof RecordApiError) {
    return error.code;
  }

  return axios.isAxiosError(error)
    ? String(error.response?.data?.code ?? '')
    : '';
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return '로그인이 필요하거나 만료되었어요. 다시 로그인해 주세요.';
    }

    if (error.response?.status === 403) {
      return '접근 권한 또는 닉네임 온보딩 완료 여부를 확인해 주세요.';
    }

    if (error.response?.status === 409) {
      return '기록 상태가 변경되었어요. 입력 내용을 복사한 뒤 서버 기록을 다시 불러와 주세요.';
    }

    if (!error.response) {
      return '서버 응답을 확인하지 못했어요. 연결을 확인하고 상태를 다시 조회해 주세요.';
    }

    return error.response.data?.message || '요청을 처리하지 못했어요.';
  }

  return error instanceof Error
    ? error.message
    : '요청을 처리하지 못했어요.';
}

export const dreamRecordApi = {
  get: (id: number, signal?: AbortSignal) =>
    request<Dream>(
      'get',
      `/api/v1/dreams/${id}`,
      undefined,
      signal,
    ),

  async findIncomplete(
    date: string,
    signal?: AbortSignal,
  ): Promise<Dream | null> {
    for (let page = 0; ; page++) {
      const result = await request<{
        items: Dream[];
        hasNext: boolean;
      }>(
        'get',
        `/api/v1/dreams/incomplete?page=${page}&size=50`,
        undefined,
        signal,
      );

      const found = result.items.find(
        (item) => item.dreamedAt === date,
      );

      if (found) {
        return found;
      }

      if (!result.hasNext) {
        return null;
      }
    }
  },

  async findByDate(
    date: string,
    signal?: AbortSignal,
  ): Promise<Dream | null> {
    const incomplete = await dreamRecordApi.findIncomplete(
      date,
      signal,
    );

    if (incomplete) {
      return incomplete;
    }

    const archive = await request<{
      items: { dreamId: number }[];
    }>(
      'get',
      `/api/v1/archives?date=${encodeURIComponent(date)}&size=1`,
      undefined,
      signal,
    );

    return archive.items[0]
      ? dreamRecordApi.get(archive.items[0].dreamId, signal)
      : null;
  },

  saveDraft: (
    date: string,
    text: string,
    dream: Dream | null,
  ) =>
    request<Dream>(
      'put',
      `/api/v1/dreams/drafts/${date}`,
      {
        originalText: text,
        ...(dream
          ? {
              dreamId: dream.dreamId,
              revision: dream.revision,
            }
          : {}),
      },
    ),

  updateCompleted: (dream: Dream, update: { originalText?: string; emotions?: Emotion[] }) => {
    if (update.emotions && (update.emotions.length < 1 || update.emotions.length > MAX_EMOTIONS)) {
      throw new RecordApiError('EMOTIONS_LIMIT', `감정은 1~${MAX_EMOTIONS}개 선택해 주세요.`);
    }

    return request<Dream>(
      'patch',
      `/api/v1/dreams/${dream.dreamId}`,
      {
        revision: dream.revision,
        ...(update.originalText !== undefined ? { originalText: update.originalText } : {}),
        ...(update.emotions
          ? { emotions: update.emotions.map((emotion) => emotionCodes[emotion]) }
          : {}),
      },
    );
  },

  submit: (dream: Dream) =>
    request<Dream>(
      'post',
      `/api/v1/dreams/${dream.dreamId}/submit`,
      {
        revision: dream.revision,
      },
    ),

  complete: (dream: Dream, emotions: Emotion[]) => {
    if (emotions.length > MAX_EMOTIONS) {
      throw new RecordApiError('EMOTIONS_LIMIT', `감정은 최대 ${MAX_EMOTIONS}개까지 선택할 수 있어요.`);
    }

    return request<Dream>(
      'put',
      `/api/v1/dreams/${dream.dreamId}/emotions`,
      {
        revision: dream.revision,
        emotions: emotions.map((emotion) => emotionCodes[emotion]),
      },
    );
  },

  generation: (id: number, signal?: AbortSignal) =>
    request<Generation>(
      'get',
      `/api/v1/dreams/${id}/generation`,
      undefined,
      signal,
    ),

  retry: (dream: Dream) =>
    request<Generation>(
      'post',
      `/api/v1/dreams/${dream.dreamId}/generation/retry`,
      {
        revision: dream.revision,
      },
    ),

  analysis: (id: number, signal?: AbortSignal) =>
    request<AnalysisResult>(
      'get',
      `/api/v1/analyses/${id}`,
      undefined,
      signal,
    ),

  story: (id: number, signal?: AbortSignal) =>
    request<StoryResult>(
      'get',
      `/api/v1/dreams/${id}/story`,
      undefined,
      signal,
    ),

  options: (signal?: AbortSignal) =>
    request<ImageOptions>(
      'get',
      '/api/v1/image-options',
      undefined,
      signal,
    ),

  balance: (signal?: AbortSignal) =>
    request<Balance>(
      'get',
      '/api/v1/credits/balance',
      undefined,
      signal,
    ),

  async image(
    id: number,
    signal?: AbortSignal,
  ): Promise<DreamImageResult | null> {
    try {
      return await request<DreamImageResult>(
        'get',
        `/api/v1/dreams/${id}/image`,
        undefined,
        signal,
      );
    } catch (error) {
      // 백엔드가 이미지가 아직 없는 경우 반환하는 명시적인 코드.
      // 최초 이미지 생성 전의 정상적인 상태이므로 null로 처리한다.
      if (
        error instanceof RecordApiError &&
        error.code === 'IMAGE_404_1'
      ) {
        return null;
      }

      // Axios rejects non-2xx responses before the envelope is handled by
      // request(). Treat only the server's explicit missing-image code as
      // an empty result; keep all other 404s and auth/server errors visible.
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404 &&
        error.response.data?.code === 'IMAGE_404_1'
      ) {
        return null;
      }

      // HTTP 404로 반환되는 경우도 동일하게 처리하되,
      // 해당 꿈이 실제 존재하고 본인 소유인지 먼저 확인한다.
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        await dreamRecordApi.get(id, signal);
        return null;
      }

      throw error;
    }
  },

  generate: (
    dream: Dream,
    style: string,
    previous: DreamImageResult | null,
  ) => {
    const regenerate =
      previous?.status === 'COMPLETED' ||
      previous?.hasPreviousResult === true;

    return request<DreamImageResult>(
      'post',
      `/api/v1/dreams/${dream.dreamId}/image`,
      {
        revision: dream.revision,
        style,
        regenerate,
        ...(regenerate
          ? { imageVersion: previous!.imageVersion }
          : {}),
      },
    );
  },

  download: (id: number, signal?: AbortSignal) =>
    request<{ url: string; expiresAt: string }>(
      'get',
      `/api/v1/images/${id}/download-url`,
      undefined,
      signal,
    ),
};
