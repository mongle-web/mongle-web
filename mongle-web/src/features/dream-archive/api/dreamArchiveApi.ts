// import { apiClient } from '@/api/client';
import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import {
  deleteWorldMock,
  getWorldListMock,
} from '@/features/dream-connect/mocks/dreamConnectMockData';
import type { ArchiveDream, ConnectedDream } from '@/features/dream-archive/types/dreamArchive';

// 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
//   GET /api/v1/worlds 의 items (worldId · name · createdAt · revision)
//   키워드 · 연결한 꿈 제목은 응답에 없어서 백엔드 확인 중
export const getConnectedDreams = async (): Promise<ConnectedDream[]> => {
  await wait();

  return sortByLatest(
    getWorldListMock().map(({ worldId, name, createdAt, keywords, dreamTitles }) => ({
      id: worldId,
      date: createdAt,
      title: name,
      keywords,
      connectedDreamTitles: dreamTitles,
    })),
  );
};

// 연결된 꿈 삭제 (세계관 폴더 삭제, 원본 꿈은 지워지지 않음)
// TODO: DELETE /api/v1/worlds/{worldId}?revision={revision} (revision은 목록 응답 값)
export const deleteConnectedDream = async (worldId: number): Promise<void> => {
  await wait();
  deleteWorldMock(worldId);
};
