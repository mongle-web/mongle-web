import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import type { CalendarDream } from '@/features/calendar/types/calendar';

// 보관함 목록 응답 (GET /api/v1/archives, 캘린더에 쓰는 필드만)
interface ArchiveItemResponse {
  dreamId: number;
  dreamedAt: string; // 'YYYY-MM-DD'
  title: string | null;
  displayKeywords: string[];
  revision: number; // 삭제 API에 넘기는 최신 버전
  image: { imageId: number; hasResult: boolean } | null; // 이미지를 아직 만들지 않았으면 null
}

interface ArchivePageResponse {
  items: ArchiveItemResponse[];
  hasNext: boolean;
  nextCursor?: string;
}

// 이미지 임시 주소 응답 (GET /api/v1/images/{imageId}/download-url, 최대 5분 유효)
interface DownloadUrlResponse {
  url: string;
}

// 한 번에 받을 최대 개수 (백엔드 최대 50, 한 달은 최대 31개라 보통 한 번에 끝남)
const ARCHIVE_PAGE_SIZE = 50;

// 썸네일 임시 주소 (못 받으면 썸네일 없이 표시)
// TODO: 백엔드에 목록 응답에 썸네일 주소를 같이 받을 수 있는지 확인 중 → 생기면 이 요청은 삭제
const getThumbnailUrl = async (imageId: number) => {
  try {
    const { data } = await apiClient.get<ApiResponse<DownloadUrlResponse>>(
      `/api/v1/images/${imageId}/download-url`,
    );
    return data.data.url;
  } catch {
    return undefined;
  }
};

// 월별 꿈 기록 조회 (month는 사람 기준 1~12)
// GET /api/v1/archives?month=YYYY-MM 으로 그 달 꿈을 받고, 이미지가 있는 꿈만 썸네일 주소를 받는다
export const getMonthlyDreams = async (year: number, month: number): Promise<CalendarDream[]> => {
  const monthParam = `${year}-${String(month).padStart(2, '0')}`;
  const items: ArchiveItemResponse[] = [];
  let cursor: string | undefined;

  do {
    const { data } = await apiClient.get<ApiResponse<ArchivePageResponse>>('/api/v1/archives', {
      params: { month: monthParam, size: ARCHIVE_PAGE_SIZE, cursor },
    });
    const { items: pageItems, hasNext, nextCursor } = data.data;

    items.push(...pageItems);
    cursor = hasNext ? nextCursor : undefined;
  } while (cursor);

  return Promise.all(
    items.map(async ({ dreamId, dreamedAt, title, displayKeywords, revision, image }) => ({
      id: dreamId,
      date: dreamedAt,
      title: title ?? '',
      keywords: displayKeywords,
      revision,
      thumbnailUrl: image?.hasResult ? await getThumbnailUrl(image.imageId) : undefined,
    })),
  );
};

// 꿈 삭제 (DELETE /api/v1/dreams/{dreamId}?revision=)
// 이미지 · 이야기를 만드는 중이면 409로 막힌다
export const deleteDream = async ({ id, revision }: CalendarDream): Promise<void> => {
  await apiClient.delete(`/api/v1/dreams/${id}`, { params: { revision } });
};
