import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import { deleteWorld } from '@/features/dream-connect/api/dreamConnectApi';
import { UNTITLED_DREAM_TITLE } from '@/features/dream-detail/types/dreamDetail';
import type {
  ArchiveDream,
  ConnectedDream,
  RecordedDream,
} from '@/features/dream-archive/types/dreamArchive';

// 날짜 · 시간 → 내 기기 기준 날짜 ('YYYY-MM-DD')
const toLocalDate = (dateTime: string) => {
  const date = new Date(dateTime);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// 최신 날짜가 위로 오도록 정렬
const sortByLatest = <T extends ArchiveDream>(dreams: T[]) =>
  [...dreams].sort((a, b) => b.date.localeCompare(a.date));

// 보관함 목록 응답 (GET /api/v1/archives, 카드에 쓰는 필드만)
interface ArchiveItemResponse {
  dreamId: number;
  dreamedAt: string; // 'YYYY-MM-DD'
  title: string | null;
  displayKeywords: string[];
  revision: number; // 삭제 · 수정 API에 넘기는 최신 버전
}

interface ArchivePageResponse {
  items: ArchiveItemResponse[];
  hasNext: boolean;
  nextCursor?: string;
}

// 한 번에 받을 최대 개수 (백엔드 최대 50)
const ARCHIVE_PAGE_SIZE = 50;
const WORLD_PAGE_SIZE = 50;

// 기록한 꿈 목록 (감정 선택까지 끝낸 꿈, 최신 날짜순)
// 검색은 화면에서 제목 · 키워드로 거르므로 다음 페이지가 없을 때까지 전부 받는다
export const getArchiveDreams = async (): Promise<RecordedDream[]> => {
  const dreams: RecordedDream[] = [];
  let cursor: string | undefined;

  do {
    const { data } = await apiClient.get<ApiResponse<ArchivePageResponse>>('/api/v1/archives', {
      params: { sort: 'LATEST', size: ARCHIVE_PAGE_SIZE, cursor },
    });
    const { items, hasNext, nextCursor } = data.data;

    dreams.push(
      ...items.map(({ dreamId, dreamedAt, title, displayKeywords, revision }) => ({
        id: dreamId,
        date: dreamedAt,
        title: title || UNTITLED_DREAM_TITLE,
        keywords: displayKeywords,
        revision,
      })),
    );

    cursor = hasNext ? nextCursor : undefined;
  } while (cursor);

  return dreams;
};

// 기록한 꿈 삭제 (DELETE /api/v1/dreams/{dreamId}?revision=)
// 연결된 꿈(세계관)에서도 이 꿈이 빠지고 폴더와 다른 꿈은 남는다
// 이미지 · 이야기를 만드는 중이면 409로 막힌다
export const deleteRecordedDream = async ({ id, revision }: RecordedDream): Promise<void> => {
  await apiClient.delete(`/api/v1/dreams/${id}`, { params: { revision } });
};

// 세계관 목록 응답 (GET /api/v1/worlds, 카드에 쓰는 필드만)
interface WorldFolderPageResponse {
  items: {
    worldId: number;
    name: string;
    revision: number; // 삭제 API에 넘기는 최신 버전
    createdAt: string;
    composedDreamCount: number; // 완성본에 남은 꿈 수
    representativeDream: { title: string | null } | null; // 가장 오래된 꿈
    summary: { generatedTitle: string | null; commonKeywords: { keyword: string }[] } | null;
  }[];
  hasNext: boolean;
  nextBeforeId?: number;
}

// 연결된 꿈 목록 (= 꿈 연결하기로 만든 세계관 목록)
// - 제목: summary.generatedTitle (AI 제목, 아직 없으면 폴더 name)
// - "첫 꿈 외 N개": representativeDream.title · composedDreamCount
// - 키워드: summary.commonKeywords[].keyword
// - 완성본에 꿈이 없는 폴더(composedDreamCount 0)는 목록에서 뺌 (백엔드 확인)
const getWorldFolders = async (): Promise<WorldFolderPageResponse['items']> => {
  const folders: WorldFolderPageResponse['items'] = [];
  let beforeId: number | undefined;

  do {
    const { data } = await apiClient.get<ApiResponse<WorldFolderPageResponse>>('/api/v1/worlds', {
      params: { size: WORLD_PAGE_SIZE, beforeId },
    });
    const { items, hasNext, nextBeforeId } = data.data;

    folders.push(...items);
    beforeId = hasNext ? nextBeforeId : undefined;
  } while (beforeId !== undefined);

  return folders;
};

export const getConnectedDreams = async (): Promise<ConnectedDream[]> => {
  const folders = await getWorldFolders();

  return sortByLatest(
    folders.flatMap(
      ({
        worldId,
        name,
        revision,
        createdAt,
        composedDreamCount,
        representativeDream,
        summary,
      }) => {
        if (composedDreamCount === 0 || !representativeDream) return [];

        return {
          id: worldId,
          date: toLocalDate(createdAt),
          title: summary?.generatedTitle || name,
          keywords: summary?.commonKeywords.map(({ keyword }) => keyword) ?? [],
          firstDreamTitle: representativeDream.title || UNTITLED_DREAM_TITLE,
          connectedDreamCount: composedDreamCount,
          revision,
        };
      },
    ),
  );
};

// 연결된 꿈 삭제 (세계관 폴더 삭제, 원본 꿈은 지워지지 않음)
// DELETE /api/v1/worlds/{worldId}?revision={revision}
export const deleteConnectedDream = ({ id, revision }: ConnectedDream): Promise<void> =>
  deleteWorld(id, revision);
