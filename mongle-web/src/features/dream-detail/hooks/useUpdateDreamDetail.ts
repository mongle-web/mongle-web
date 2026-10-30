import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDreamDetail } from '@/features/dream-detail/api/dreamDetailApi';
import type { DreamDetail, DreamDetailUpdate } from '@/features/dream-detail/types/dreamDetail';

// 꿈 수정 후 상세 · 보관함 · 캘린더 등 꿈 관련 데이터를 다시 불러온다
// (수정 응답에는 이야기 · 이미지가 없어서 상세도 새로 받음)
export const useUpdateDreamDetail = (dream: DreamDetail) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: DreamDetailUpdate) => updateDreamDetail(dream, update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dreams'] }),
  });
};
