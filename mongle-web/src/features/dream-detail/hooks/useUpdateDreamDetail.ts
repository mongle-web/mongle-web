import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDreamDetail } from '@/features/dream-detail/api/dreamDetailApi';
import type { DreamDetailUpdate } from '@/features/dream-detail/types/dreamDetail';

// 꿈 수정 후 상세 화면 데이터를 바로 바꾸고, 꿈 관련 목록(캘린더 등)도 다시 불러온다
export const useUpdateDreamDetail = (dreamId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: DreamDetailUpdate) => updateDreamDetail(dreamId, update),
    onSuccess: (dream) => {
      queryClient.setQueryData(['dreams', 'detail', dreamId], dream);
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
    },
  });
};
