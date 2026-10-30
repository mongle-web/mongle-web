import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRecordedDream } from '@/features/dream-archive/api/dreamArchiveApi';
import type { RecordedDream } from '@/features/dream-archive/types/dreamArchive';

// 기록한 꿈 삭제 후 꿈 관련 목록(보관함 · 연결된 꿈 등)을 다시 불러온다
export const useDeleteRecordedDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dream: RecordedDream) => deleteRecordedDream(dream),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
    },
  });
};
