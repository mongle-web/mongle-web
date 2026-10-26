import { useQuery } from '@tanstack/react-query';

import { DreamNotFoundError, getDreamDetail } from '@/features/dream-detail/api/dreamDetailApi';

export const useDreamDetail = (dreamId: number) => {
  return useQuery({
    queryKey: ['dreams', 'detail', dreamId],
    queryFn: () => getDreamDetail(dreamId),
    enabled: Number.isInteger(dreamId) && dreamId > 0,
    // 없는 꿈은 다시 요청해도 결과가 같으니 재시도하지 않음
    retry: (failureCount, error) => !(error instanceof DreamNotFoundError) && failureCount < 1,
  });
};
