import { useQuery } from '@tanstack/react-query';

import { getWorldResult } from '@/features/dream-connect/api/dreamConnectApi';

// 연결 결과 화면 데이터
export const useWorldResult = (worldId: number) => {
  return useQuery({
    queryKey: ['dreams', 'connect', 'world', worldId],
    queryFn: () => getWorldResult(worldId),
    enabled: Number.isInteger(worldId) && worldId > 0,
  });
};
