import { isAxiosError } from 'axios';

import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import type {
  DreamDetail,
  DreamDetailUpdate,
  DreamStorySegment,
} from '@/features/dream-detail/types/dreamDetail';
import { emotionCodes } from '@/features/dream-record/api/dreamRecordApi';

// 찾는 꿈이 없을 때 (삭제됐거나 잘못된 주소)
export class DreamNotFoundError extends Error {
  constructor() {
    super('꿈 기록을 찾을 수 없어요.');
    this.name = 'DreamNotFoundError';
  }
}

// 백엔드 감정 코드 → 화면에 보여줄 감정 이름 (꿈 기록과 같은 기준 사용)
const EMOTION_LABELS = Object.fromEntries(
  Object.entries(emotionCodes).map(([label, code]) => [code, label]),
) as Record<string, string>;

// 꿈 상세 응답 (GET /api/v1/archives/{dreamId}, 화면에 쓰는 필드만)
interface ArchiveDetailResponse {
  dream: {
    dreamId: number;
    dreamedAt: string; // 'YYYY-MM-DD'
    title: string | null;
    displayKeywords: string[];
    revision: number; // 수정 API에 넘기는 최신 버전
    story: { hasResult: boolean } | null; // 이야기를 아직 만들지 않았으면 null
    image: { imageId: number; hasResult: boolean } | null; // 이미지를 아직 만들지 않았으면 null
  };
  originalText: string;
  emotions: string[];
}

// 꿈 이야기 응답 (GET /api/v1/dreams/{dreamId}/story)
// SCENE: AI가 다듬은 장면 / AI_BRIDGE: AI가 장면 사이를 이어 쓴 부분 → 토글을 켜면 강조
interface StoryResponse {
  sections: { sequence: number; kind: 'SCENE' | 'AI_BRIDGE'; content: string }[];
}

// 이미지 임시 주소 응답 (GET /api/v1/images/{imageId}/download-url, 최대 5분 유효)
interface DownloadUrlResponse {
  url: string;
}

const isNotFound = (error: unknown) => isAxiosError(error) && error.response?.status === 404;

// 이야기 조각을 순서대로 이어 붙이고, 조각 사이는 한 칸 띄움
const toStorySegments = (sections: StoryResponse['sections']): DreamStorySegment[] =>
  [...sections]
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ kind, content }, index, list) => ({
      text: index < list.length - 1 ? `${content} ` : content,
      isAi: kind === 'AI_BRIDGE',
    }));

const getStory = async (dreamId: number) => {
  const { data } = await apiClient.get<ApiResponse<StoryResponse>>(
    `/api/v1/dreams/${dreamId}/story`,
  );
  return toStorySegments(data.data.sections);
};

const getImageUrl = async (imageId: number) => {
  const { data } = await apiClient.get<ApiResponse<DownloadUrlResponse>>(
    `/api/v1/images/${imageId}/download-url`,
  );
  return data.data.url;
};

// 꿈 상세 조회
// 꿈 정보를 받은 뒤, 이야기 · 이미지가 있으면 함께 받아온다 (없는 꿈 · 남의 꿈은 404)
export const getDreamDetail = async (dreamId: number): Promise<DreamDetail> => {
  let detail: ArchiveDetailResponse;

  try {
    const { data } = await apiClient.get<ApiResponse<ArchiveDetailResponse>>(
      `/api/v1/archives/${dreamId}`,
    );
    detail = data.data;
  } catch (error) {
    if (isNotFound(error)) throw new DreamNotFoundError();
    throw error;
  }

  const { dream, originalText, emotions } = detail;

  const [aiStory, imageUrl] = await Promise.all([
    dream.story?.hasResult ? getStory(dreamId) : undefined,
    dream.image?.hasResult ? getImageUrl(dream.image.imageId) : undefined,
  ]);

  return {
    id: dream.dreamId,
    date: dream.dreamedAt,
    title: dream.title ?? '',
    content: originalText,
    aiStory,
    imageUrl,
    emotions: emotions.map((code) => EMOTION_LABELS[code] ?? code),
    keywords: dream.displayKeywords,
    revision: dream.revision,
  };
};

// 꿈 제목 · 내용 수정 (PATCH /api/v1/dreams/{dreamId})
// 바뀐 항목만 보낸다 (제목만 바꾸면 AI 결과가 그대로 유지됨)
// 이야기 · 이미지를 만드는 중이거나 다른 곳에서 먼저 수정했으면 409
export const updateDreamDetail = async (
  dream: DreamDetail,
  { title, content }: DreamDetailUpdate,
): Promise<void> => {
  await apiClient.patch(`/api/v1/dreams/${dream.id}`, {
    revision: dream.revision,
    ...(title !== dream.title && { title }),
    ...(content !== dream.content && { originalText: content }),
  });
};
