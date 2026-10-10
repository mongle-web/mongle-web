// import { apiClient } from '@/api/client';
import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import type { CalendarDream } from '@/features/calendar/types/calendar';

// 월별 꿈 기록 조회
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
//   const response = await apiClient.get<CalendarDream[]>('/dreams/calendar', {
//     params: { year, month },
//   });
//   return response.data;
export const getMonthlyDreams = async (year: number, month: number): Promise<CalendarDream[]> => {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  // 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return calendarMockDreams.filter((dream) => dream.date.startsWith(monthPrefix));
};

// 꿈 삭제
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
//   await apiClient.delete(`/dreams/${dreamId}`);
export const deleteDream = async (dreamId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = calendarMockDreams.findIndex((dream) => dream.id === dreamId);
  if (index === -1) throw new Error('삭제할 꿈을 찾지 못했어요.');

  calendarMockDreams.splice(index, 1);
};
