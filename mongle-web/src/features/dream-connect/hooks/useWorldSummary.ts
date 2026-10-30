import { useEffect, useRef } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getWorldSummary, requestWorldSummary } from '@/features/dream-connect/api/dreamConnectApi';

// 요약 상태 확인 간격 (백엔드 권장값)
// 처음에는 2초마다, 30초가 지나면 5초마다 확인 (30초가 지나도 실패로 보지 않고 계속 확인)
const SUMMARY_POLLING_MS = 2000;
const SUMMARY_SLOW_POLLING_MS = 5000;
const SUMMARY_SLOW_AFTER_MS = 30000;

// 키를 연결 결과 키 아래에 둬서 "+"로 다시 연결했을 때 결과와 함께 다시 불러옴
const summaryQueryKey = (worldId: number) => ['dreams', 'connect', 'world', worldId, 'summary'];

// 연결 결과 화면의 세계관 요약 (AI 제목 · 공통 키워드 · 반복되는 감정)
// - 요약은 연결이 완성된 뒤 서버가 따로 만들어서, 만드는 중(PENDING · PROCESSING)이면 끝날 때까지 다시 확인
// - 완료 · 실패 · 출처 없음(COMPLETED · FAILED · EMPTY)이 되거나 화면을 벗어나면 확인 중단
// - 요약이 없는 세계관(NOT_GENERATED)이면 한 번만 생성을 요청 (무료)
//   처음 만든 적이 없거나, 요약에 쓴 원본 꿈이 지워져서 요약이 지워진 경우
//   실패(FAILED)는 자동으로 다시 요청하지 않음 (TODO: "다시 시도" 버튼은 디자인 확인 중)
export const useWorldSummary = (worldId: number) => {
  const queryClient = useQueryClient();

  // 만드는 중 상태를 처음 본 시각 (30초가 지나면 확인 간격을 늘림)
  const pollingStartedAtRef = useRef<number | null>(null);
  // 생성을 요청한 세계관 (같은 화면에서 다른 세계관으로 바뀌어도 다시 요청할 수 있게 id로 기억)
  const requestedWorldIdRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: summaryQueryKey(worldId),
    queryFn: () => getWorldSummary(worldId),
    enabled: Number.isInteger(worldId) && worldId > 0,
    refetchInterval: (current) => {
      const status = current.state.data?.status;
      if (status !== 'PENDING' && status !== 'PROCESSING') {
        pollingStartedAtRef.current = null;
        return false;
      }

      pollingStartedAtRef.current ??= Date.now();
      const elapsed = Date.now() - pollingStartedAtRef.current;
      return elapsed >= SUMMARY_SLOW_AFTER_MS ? SUMMARY_SLOW_POLLING_MS : SUMMARY_POLLING_MS;
    },
  });

  const status = query.data?.status;

  useEffect(() => {
    if (status !== 'NOT_GENERATED' || requestedWorldIdRef.current === worldId) return;
    requestedWorldIdRef.current = worldId;

    // 요청에 실패해도 제목은 폴더 이름으로 보여주므로 조용히 넘어감
    requestWorldSummary(worldId)
      .then(() => queryClient.invalidateQueries({ queryKey: summaryQueryKey(worldId) }))
      .catch(() => {});
  }, [status, worldId, queryClient]);

  return query;
};
