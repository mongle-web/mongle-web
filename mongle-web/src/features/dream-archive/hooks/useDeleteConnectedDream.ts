import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteConnectedDream } from '@/features/dream-archive/api/dreamArchiveApi';
import type { ConnectedDream } from '@/features/dream-archive/types/dreamArchive';

// 연결된 꿈(세계관) 삭제 후 보관함 목록을 다시 불러온다
export const useDeleteConnectedDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dream: ConnectedDream) => deleteConnectedDream(dream),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams', 'archive', 'connected'] });
    },
  });
};
