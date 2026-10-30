import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import {
  deleteWorldMock,
  getWorldListMock,
} from '@/features/dream-connect/mocks/dreamConnectMockData';
import type {
  ArchiveDream,
  ConnectedDream,
  RecordedDream,
} from '@/features/dream-archive/types/dreamArchive';

// 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
        title: title ?? '',
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

// 연결된 꿈 목록 (= 꿈 연결하기로 만든 세계관 목록, Mock도 꿈 연결하기와 같은 데이터 사용)
// TODO: 백엔드 API 연동 시 Mock 부분을 지우고 아래 API로 교체 (beforeId로 다음 페이지 이어 받기 필요)
//   const items = (await apiClient.get('/api/v1/worlds', { params: { size: 50 } })).data.data.items;
//   그 뒤 아래와 같은 방식으로 카드에 필요한 값만 꺼내서 반환
//   - 제목: summary.generatedTitle (AI 제목, 아직 없으면 폴더 name)
//   - "첫 꿈 외 N개": representativeDream.title · composedDreamCount
//   - 키워드: summary.commonKeywords[].keyword
//   - 빈 폴더(완성본에 꿈이 없음)도 내려오므로 composedDreamCount가 0이면 뺌 (백엔드에 기준 확인 중)
export const getConnectedDreams = async (): Promise<ConnectedDream[]> => {
  await wait();

  return sortByLatest(
    getWorldListMock().flatMap(
      ({ worldId, name, createdAt, composedDreamCount, representativeDream, summary }) => {
        if (composedDreamCount === 0 || !representativeDream) return [];

        return {
          id: worldId,
          date: toLocalDate(createdAt),
          title: summary?.generatedTitle || name,
          keywords: summary?.commonKeywords.map(({ keyword }) => keyword) ?? [],
          firstDreamTitle: representativeDream.title,
          connectedDreamCount: composedDreamCount,
        };
      },
    ),
  );
};

// 연결된 꿈 삭제 (세계관 폴더 삭제, 원본 꿈은 지워지지 않음)
// TODO: DELETE /api/v1/worlds/{worldId}?revision={revision} (revision은 목록 응답 값)
export const deleteConnectedDream = async (worldId: number): Promise<void> => {
  await wait();
  deleteWorldMock(worldId);
};
