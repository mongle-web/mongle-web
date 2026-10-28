import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getConnectableDreams } from '@/features/dream-connect/api/dreamConnectApi';
import type { ConnectSort } from '@/features/dream-connect/types/dreamConnect';

// 꿈 선택 목록 (정렬을 바꾸는 동안 이전 목록 유지)
export const useConnectableDreams = (sort: ConnectSort) => {
  return useQuery({
    queryKey: ['dreams', 'connect', 'candidates', sort],
    queryFn: () => getConnectableDreams(sort),
    placeholderData: keepPreviousData,
  });
};
