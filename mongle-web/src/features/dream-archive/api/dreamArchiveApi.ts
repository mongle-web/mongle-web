// import { apiClient } from '@/api/client';
import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import {
  deleteWorldMock,
  getWorldListMock,
} from '@/features/dream-connect/mocks/dreamConnectMockData';
import type { ArchiveDream, ConnectedDream } from '@/features/dream-archive/types/dreamArchive';

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

// 기록한 꿈 목록
// TODO: 백엔드 API 연동 시 Mock 부분을 지우고 아래 API로 교체 (커서로 다음 페이지 이어 받기 필요)
//   GET /api/v1/archives?sort=LATEST 의 items (dreamId · dreamedAt · title · displayKeywords)
export const getArchiveDreams = async (): Promise<ArchiveDream[]> => {
  await wait();

  return sortByLatest(
    calendarMockDreams.map(({ id, date, title, keywords }) => ({ id, date, title, keywords })),
  );
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
