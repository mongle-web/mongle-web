import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addDreamToWorld,
  createWorld,
  deleteWorld,
  getComposition,
  getWorld,
  getWorldSummary,
  removeDreamFromWorld,
  requestWorldSummary,
  startComposition,
} from '@/features/dream-connect/api/dreamConnectApi';
import type {
  ConnectableDream,
  WorldSummaryStatus,
} from '@/features/dream-connect/types/dreamConnect';
import {
  isJobInProgress,
  isTimeoutError,
  pollJob,
  sleep,
} from '@/features/dream-connect/utils/polling';

type ConnectStatus = 'idle' | 'connecting' | 'error';

interface ConnectRun {
  isCancelled: boolean;
  isNewWorld: boolean; // 새로 만든 폴더일 때만 중단 시 삭제
  isCompositionDone: boolean; // 연결은 완성되고 요약만 기다리는 중 (이때는 중단해도 폴더를 지우지 않음)
  skipSummary: boolean; // 요약을 그만 기다리고 바로 결과 화면으로
  worldId?: number;
  revision?: number;
}

// 요약 상태 확인 간격 (백엔드 권장값: 처음 2초, 30초가 지나면 5초, 시간이 지나도 실패로 보지 않음)
const SUMMARY_POLLING_MS = 2000;
const SUMMARY_SLOW_POLLING_MS = 5000;
const SUMMARY_SLOW_AFTER_MS = 30000;

// 세계관 요약(AI 제목 · 공통 키워드 · 반복되는 감정)이 다 만들어질 때까지 기다림
// - 연결이 완성되면 서버가 자동으로 만들기 시작하고, 한 번도 만든 적 없으면(NOT_GENERATED) 한 번만 요청
// - 완료 · 실패 · 출처 없음이 되면 끝 (실패해도 결과 화면은 보여줌, 제목은 폴더 이름)
// - 요약을 불러오지 못해도 결과 화면으로 넘어감 (결과 화면에서 다시 확인)
const waitForSummary = async (worldId: number, shouldStop: () => boolean) => {
  const startedAt = Date.now();
  let hasRequested = false;

  while (!shouldStop()) {
    let status: WorldSummaryStatus;
    try {
      ({ status } = await getWorldSummary(worldId));
    } catch {
      return;
    }

    if (status === 'NOT_GENERATED') {
      if (hasRequested) return;
      hasRequested = true;
      await requestWorldSummary(worldId).catch(() => {});
      continue;
    }

    if (status !== 'PENDING' && status !== 'PROCESSING') return;

    const elapsed = Date.now() - startedAt;
    await sleep(elapsed >= SUMMARY_SLOW_AFTER_MS ? SUMMARY_SLOW_POLLING_MS : SUMMARY_POLLING_MS);
  }
};

// 이미 연결된 꿈에 더하거나 빼서 다시 연결할 때 (결과 화면 "+")
interface ExistingWorld {
  worldId: number;
  connectedDreamIds: number[];
}

// TODO: 세계관 이름은 필수인데 피그마에 입력 단계가 없어서 임시 이름 사용 (백엔드 · 기획 확인 중)
const makeWorldName = (dreams: ConnectableDream[]) => {
  const [first, ...rest] = [...dreams].sort((a, b) => a.dreamedAt.localeCompare(b.dreamedAt));
  return `${first.title} 외 ${rest.length}개`;
};

// 꿈 연결하기 전체 흐름
// 새로 연결: 1) 세계관 폴더 만들기 → 2) 고른 꿈 하나씩 넣기 → 3) 연결 생성 시작 → 4) 완료될 때까지 상태 확인
//   → 5) 요약(AI 제목 · 키워드 · 감정)까지 만들어지면 결과 화면으로 (그동안 "꿈을 연결하고 있어요..." 모달 유지)
// 꿈 추가(결과 화면 "+"): 기존 폴더에 새로 고른 꿈은 넣고, 체크를 푼 꿈은 뺀 뒤 3) ~ 5)
// cancel(): X 버튼 → 상태 확인을 멈추고, 새로 만든 폴더였다면 삭제해서 연결 중단
//   (꿈 추가 중 중단하면 기존 연결 결과는 그대로 남음)
//   5) 요약을 기다리는 중이면 연결은 이미 완성됐으므로 지우지 않고 바로 결과 화면으로
export const useConnectDreams = (onCompleted: (worldId: number) => void) => {
  const [status, setStatus] = useState<ConnectStatus>('idle');

  // 진행 중인 연결 정보 (중단할 때 삭제하려고 보관)
  const runRef = useRef<ConnectRun | null>(null);

  const cancel = useCallback(() => {
    const run = runRef.current;
    if (!run) return;

    if (run.isCompositionDone) {
      run.skipSummary = true;
      return;
    }

    run.isCancelled = true;
    runRef.current = null;
    setStatus('idle');

    if (run.isNewWorld && run.worldId !== undefined && run.revision !== undefined) {
      // 실패해도 화면은 이미 닫혔으니 조용히 넘어감
      deleteWorld(run.worldId, run.revision).catch(() => {});
    }
  }, []);

  // 화면을 벗어나면 진행 중인 연결 중단 (연결이 이미 완성됐으면 지우지 않고 기다림만 멈춤)
  useEffect(
    () => () => {
      const run = runRef.current;
      if (!run) return;

      if (run.isCompositionDone) {
        run.isCancelled = true;
        runRef.current = null;
        return;
      }

      cancel();
    },
    [cancel],
  );

  const connect = async (dreams: ConnectableDream[], existing?: ExistingWorld) => {
    if (runRef.current) return;

    const run: ConnectRun = {
      isCancelled: false,
      isNewWorld: !existing,
      isCompositionDone: false,
      skipSummary: false,
    };
    runRef.current = run;
    setStatus('connecting');

    try {
      const selectedIds = dreams.map((dream) => dream.dreamId);
      const connectedIds = existing?.connectedDreamIds ?? [];

      let world = existing
        ? await getWorld(existing.worldId)
        : await createWorld(makeWorldName(dreams));
      run.worldId = world.worldId;
      run.revision = world.revision;

      // 새로 고른 꿈 넣기
      for (const dreamId of selectedIds.filter((id) => !connectedIds.includes(id))) {
        if (run.isCancelled) return;
        world = await addDreamToWorld(world.worldId, dreamId, world.revision);
        run.revision = world.revision;
      }

      // 체크를 푼 꿈 빼기
      for (const dreamId of connectedIds.filter((id) => !selectedIds.includes(id))) {
        if (run.isCancelled) return;
        world = await removeDreamFromWorld(world.worldId, dreamId, world.revision);
        run.revision = world.revision;
      }

      if (run.isCancelled) return;
      // 생성 요청 전 상태 (요청 뒤 새 작업인지 비교용)
      const before = await getComposition(world.worldId);

      try {
        await startComposition(world.worldId, world.revision, before.compositionRevision);
      } catch (error) {
        // 제한시간 초과는 서버에 접수됐을 수 있어서 다시 보내지 않고 상태 확인으로 넘어감
        if (!isTimeoutError(error)) throw error;
      }

      const composition = await pollJob({
        fetchStatus: () => getComposition(world.worldId),
        isCancelled: () => run.isCancelled,
        // attemptId가 없으면 아직 접수 전
        // 진행 중이면 이번 요청(같은 요청이면 서버가 이어서 처리), 끝난 상태면 요청 전과 다른 새 작업일 때만
        isRequestedJob: (current) =>
          current.attemptId !== null &&
          (isJobInProgress(current) ||
            current.attemptId !== before.attemptId ||
            current.jobVersion !== before.jobVersion),
      });
      if (!composition) return;

      run.isCompositionDone = true;
      await waitForSummary(world.worldId, () => run.isCancelled || run.skipSummary);
      if (run.isCancelled) return;

      runRef.current = null;
      setStatus('idle');
      onCompleted(world.worldId);
    } catch {
      if (run.isCancelled) return;
      runRef.current = null;
      setStatus('error');

      // 새로 만든 폴더인데 연결이 완성되지 못했으면 빈 폴더가 서버에 남지 않게 삭제
      // (꿈 추가 · 다시 연결 중 실패는 기존 연결 결과를 지키기 위해 지우지 않음)
      if (
        run.isNewWorld &&
        !run.isCompositionDone &&
        run.worldId !== undefined &&
        run.revision !== undefined
      ) {
        // 실패해도 화면에는 이미 실패 모달이 떠 있으니 조용히 넘어감
        deleteWorld(run.worldId, run.revision).catch(() => {});
      }
    }
  };

  return { status, connect, cancel, resetError: () => setStatus('idle') };
};
