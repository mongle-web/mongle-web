import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDream } from '@/features/calendar/api/calendarApi';

// 꿈 삭제 후 꿈 관련 목록(캘린더 등)을 다시 불러와서 화면에서 제거
export const useDeleteDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dreamId: number) => deleteDream(dreamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
    },
  });
};
