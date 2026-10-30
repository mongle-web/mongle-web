import { useQuery } from '@tanstack/react-query';

import { getWorldSummary } from '@/features/dream-connect/api/dreamConnectApi';
import { POLLING_INTERVAL_MS } from '@/features/dream-connect/utils/polling';

// 연결 결과 화면의 세계관 요약 (AI 제목 · 공통 키워드 · 반복되는 감정)
// 요약은 연결이 완성된 뒤 서버가 따로 만들어서, 만드는 중이면 완료될 때까지 다시 확인
// 키를 연결 결과 키 아래에 둬서 "+"로 다시 연결했을 때 결과와 함께 다시 불러옴
export const useWorldSummary = (worldId: number) => {
  return useQuery({
    queryKey: ['dreams', 'connect', 'world', worldId, 'summary'],
    queryFn: () => getWorldSummary(worldId),
    enabled: Number.isInteger(worldId) && worldId > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? POLLING_INTERVAL_MS : false;
    },
  });
};
