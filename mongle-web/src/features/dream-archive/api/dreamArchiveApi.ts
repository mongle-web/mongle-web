// import { apiClient } from '@/api/client';
import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import { connectedMockDreams } from '@/features/dream-archive/mocks/dreamArchiveMockData';
import type { ArchiveDream, ConnectedDream } from '@/features/dream-archive/types/dreamArchive';

// 최신 날짜가 위로 오도록 정렬
const sortByLatest = <T extends ArchiveDream>(dreams: T[]) =>
  [...dreams].sort((a, b) => b.date.localeCompare(a.date));

// 기록한 꿈 목록
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
//   const response = await apiClient.get<ArchiveDream[]>('/dreams');
//   return response.data;
export const getArchiveDreams = async (): Promise<ArchiveDream[]> => {
  // 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return sortByLatest(
    calendarMockDreams.map(({ id, date, title, keywords }) => ({ id, date, title, keywords })),
  );
};

// 연결된 꿈 목록
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
//   const response = await apiClient.get<ConnectedDream[]>('/dreams/connections');
//   return response.data;
export const getConnectedDreams = async (): Promise<ConnectedDream[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return sortByLatest(connectedMockDreams);
};

// 연결된 꿈 삭제
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
//   await apiClient.delete(`/dreams/connections/${connectionId}`);
export const deleteConnectedDream = async (connectionId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = connectedMockDreams.findIndex((dream) => dream.id === connectionId);
  if (index === -1) throw new Error('삭제할 꿈을 찾지 못했어요.');

  connectedMockDreams.splice(index, 1);
};
