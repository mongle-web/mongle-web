import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMonthlyDreams } from '@/features/calendar/api/calendarApi';

// month는 사람 기준 월(1~12)
export const useMonthlyDreams = (year: number, month: number) => {
  return useQuery({
    queryKey: ['dreams', 'calendar', year, month],
    queryFn: () => getMonthlyDreams(year, month),
    // 달을 넘기는 동안 이전 달 데이터를 유지해서 캘린더가 깜빡이지 않게 함
    placeholderData: keepPreviousData,
    // 썸네일 임시 주소가 5분 뒤 만료되므로 4분 동안만 그대로 쓰고, 그 뒤에는 다시 받음
    // (매번 다시 받으면 주소가 바뀌어 썸네일이 새로 로딩됨)
    staleTime: 4 * 60 * 1000,
  });
};
