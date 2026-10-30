import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMonthlyDreams } from '@/features/calendar/api/calendarApi';

// month는 사람 기준 월(1~12)
export const useMonthlyDreams = (year: number, month: number) => {
  return useQuery({
    queryKey: ['dreams', 'calendar', year, month],
    queryFn: () => getMonthlyDreams(year, month),
    // 달을 넘기는 동안 이전 달 데이터를 유지해서 캘린더가 깜빡이지 않게 함
    placeholderData: keepPreviousData,
  });
};
