import { useQuery } from '@tanstack/react-query';

import {
  getDreamMutationStatus,
  getDreamWorldImpacts,
} from '@/features/dream-detail/api/dreamDetailApi';

// 꿈 삭제 확인 창용 사전 확인 (캘린더 · 보관함 공용)
// dreamId가 있을 때(확인 창이 열렸을 때)만 조회, 조회 실패 시 기본 안내로 두고 삭제는 허용 (서버가 다시 검사)
export const useDreamDeleteCheck = (dreamId: number | null) => {
  const enabled = dreamId !== null;

  const status = useQuery({
    queryKey: ['dreams', 'mutation-status', dreamId],
    queryFn: () => getDreamMutationStatus(dreamId!),
    enabled,
    staleTime: 0,
  });

  const impacts = useQuery({
    queryKey: ['dreams', 'world-impacts', dreamId],
    queryFn: () => getDreamWorldImpacts(dreamId!),
    enabled,
    staleTime: 0,
  });

  const canDelete = status.data?.mutable !== false;
  const worldCount = impacts.data?.items.length ?? 0;
  const hasMoreWorlds = impacts.data?.hasNext ?? false;

  const message = (() => {
    if (!canDelete) return '이야기와 이미지를 만드는 중이라 지금은 삭제할 수 없어요.';
    if (worldCount > 0) {
      return `연결된 꿈 ${worldCount}${hasMoreWorlds ? '개 이상' : '개'}에 포함된 꿈이에요. 삭제하면 연결된 꿈에서도 빠지고, 다시 되돌릴 수 없어요.`;
    }
    return '삭제하면 다시 되돌릴 수 없어요.';
  })();

  return { canDelete, message, isChecking: status.isFetching || impacts.isFetching };
};
