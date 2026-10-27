import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteConnectedDream } from '@/features/dream-archive/api/dreamArchiveApi';

// 연결된 꿈 삭제 후 보관함 목록을 다시 불러온다
export const useDeleteConnectedDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: number) => deleteConnectedDream(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams', 'archive', 'connected'] });
    },
  });
};
