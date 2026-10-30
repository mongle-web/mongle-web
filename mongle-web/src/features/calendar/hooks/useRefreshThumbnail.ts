import { useQueryClient } from '@tanstack/react-query';

import { refreshThumbnailUrl } from '@/features/calendar/api/calendarApi';
import type { CalendarDream } from '@/features/calendar/types/calendar';

// 썸네일을 불러오지 못했을 때 주소를 새로 받고, 캘린더 목록에 새 주소를 반영
// force: 사용자가 "다시 시도"를 누른 경우 (자동 재시도는 이미지마다 한 번만)
export const useRefreshThumbnail = () => {
  const queryClient = useQueryClient();

  return async (dream: CalendarDream, force = false) => {
    if (!dream.thumbnail) return;

    const refreshed = await refreshThumbnailUrl(dream.thumbnail, force);
    if (refreshed) await queryClient.invalidateQueries({ queryKey: ['dreams', 'calendar'] });
  };
};
