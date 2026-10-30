import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import type { CalendarDream, DreamThumbnail } from '@/features/calendar/types/calendar';

// 보관함 목록 응답 (GET /api/v1/archives, 캘린더에 쓰는 필드만)
interface ArchiveItemResponse {
  dreamId: number;
  dreamedAt: string; // 'YYYY-MM-DD'
  title: string | null;
  displayKeywords: string[];
  revision: number; // 삭제 API에 넘기는 최신 버전
  // 이미지를 아직 만들지 않았으면 null, imageId가 있어도 hasResult가 false면 성공 파일 없음
  image: { imageId: number; imageVersion: number; hasResult: boolean } | null;
}

interface ArchivePageResponse {
  items: ArchiveItemResponse[];
  hasNext: boolean;
  nextCursor?: string;
}

// 이미지 임시 주소 응답 (GET /api/v1/images/{imageId}/download-url)
interface DownloadUrlResponse {
  url: string;
  expiresAt: string; // 이 시각까지 주소 사용 가능 (이미지가 지워지는 시각 아님)
}

// 한 달은 최대 31일 · 하루 1개라 한 번에 받음 (백엔드 권장값)
const MONTH_PAGE_SIZE = 31;

// 썸네일 주소를 동시에 몇 개까지 받을지 (백엔드 권장값)
// TODO: 백엔드가 동시 요청 수를 10개 이상으로 늘리면 같이 늘리기
const THUMBNAIL_CONCURRENCY = 4;

// 만료 직전 주소는 화면에 뜨기 전에 끊길 수 있어서 30초 남으면 새로 받음
const URL_EXPIRY_MARGIN_MS = 30 * 1000;

// 받은 썸네일 주소를 화면 메모리에 저장해 두고 만료 전까지 재사용
// key: imageId + imageVersion (다시 생성해서 버전이 바뀌면 새로 받음)
// url이 null이면 발급 실패 (지워진 이미지 등) → 같은 버전은 다시 요청하지 않음
const thumbnailCache = new Map<string, { url: string | null; expiresAt: number }>();

// 화면에서 불러오기 실패로 한 번 다시 받은 썸네일 (계속 실패하면 반복하지 않기 위해)
const refreshedThumbnails = new Set<string>();

const toCacheKey = ({ imageId, imageVersion }: DreamThumbnail) => `${imageId}:${imageVersion}`;

// 썸네일 임시 주소 받기 (못 받으면 undefined → 썸네일 없이 표시)
// TODO: 백엔드에 여러 imageId를 한 번에 받는 API가 생기면 그걸로 교체
const getThumbnailUrl = async (thumbnail: DreamThumbnail, force = false) => {
  const key = toCacheKey(thumbnail);
  const cached = thumbnailCache.get(key);

  if (!force && cached && cached.expiresAt - Date.now() > URL_EXPIRY_MARGIN_MS) {
    return cached.url ?? undefined;
  }

  try {
    const { data } = await apiClient.get<ApiResponse<DownloadUrlResponse>>(
      `/api/v1/images/${thumbnail.imageId}/download-url`,
    );
    const { url, expiresAt } = data.data;

    thumbnailCache.set(key, { url, expiresAt: Date.parse(expiresAt) });
    return url;
  } catch {
    // 실패도 잠시 저장해 두고 같은 버전은 반복해서 요청하지 않음 (월을 다시 열면 5분 뒤 다시 시도)
    thumbnailCache.set(key, { url: null, expiresAt: Date.now() + 5 * 60 * 1000 });
    return undefined;
  }
};

// 목록을 limit개씩 나눠서 동시에 처리 (순서는 그대로 유지)
const mapWithLimit = async <T, R>(list: T[], limit: number, fn: (item: T) => Promise<R>) => {
  const results = new Array<R>(list.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < list.length) {
      const index = nextIndex++;
      results[index] = await fn(list[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, worker));
  return results;
};

// 월별 꿈 기록 조회 (month는 사람 기준 1~12)
// GET /api/v1/archives?month=YYYY-MM 으로 그 달 꿈을 받고, 성공한 이미지가 있는 꿈만 썸네일 주소를 받는다
export const getMonthlyDreams = async (year: number, month: number): Promise<CalendarDream[]> => {
  const monthParam = `${year}-${String(month).padStart(2, '0')}`;
  const items: ArchiveItemResponse[] = [];
  let cursor: string | undefined;

  do {
    const { data } = await apiClient.get<ApiResponse<ArchivePageResponse>>('/api/v1/archives', {
      params: { month: monthParam, size: MONTH_PAGE_SIZE, cursor },
    });
    const { items: pageItems, hasNext, nextCursor } = data.data;

    items.push(...pageItems);
    cursor = hasNext ? nextCursor : undefined;
  } while (cursor);

  return mapWithLimit(
    items,
    THUMBNAIL_CONCURRENCY,
    async ({ dreamId, dreamedAt, title, displayKeywords, revision, image }) => {
      const thumbnail = image?.hasResult
        ? { imageId: image.imageId, imageVersion: image.imageVersion }
        : undefined;

      return {
        id: dreamId,
        date: dreamedAt,
        title: title ?? '',
        keywords: displayKeywords,
        revision,
        thumbnail,
        thumbnailUrl: thumbnail ? await getThumbnailUrl(thumbnail) : undefined,
      };
    },
  );
};

// 썸네일 주소 다시 받기 (이미지를 불러오지 못했을 때)
// - 자동 재시도: 같은 이미지는 한 번만 (계속 실패하면 대체 화면 유지)
// - 사용자가 "다시 시도"를 누른 경우(force): 횟수 상관없이 다시 받음
// 새 주소를 받았으면 true
export const refreshThumbnailUrl = async (thumbnail: DreamThumbnail, force = false) => {
  const key = toCacheKey(thumbnail);
  if (!force && refreshedThumbnails.has(key)) return false;

  refreshedThumbnails.add(key);
  return Boolean(await getThumbnailUrl(thumbnail, true));
};

// 꿈 삭제 (DELETE /api/v1/dreams/{dreamId}?revision=)
// 이미지 · 이야기를 만드는 중이면 409로 막힌다
export const deleteDream = async ({ id, revision }: CalendarDream): Promise<void> => {
  await apiClient.delete(`/api/v1/dreams/${id}`, { params: { revision } });
};
