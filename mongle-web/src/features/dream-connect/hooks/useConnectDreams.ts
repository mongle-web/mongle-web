import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addDreamToWorld,
  createWorld,
  deleteWorld,
  getComposition,
  getWorld,
  removeDreamFromWorld,
  startComposition,
} from '@/features/dream-connect/api/dreamConnectApi';
import type { ConnectableDream } from '@/features/dream-connect/types/dreamConnect';
import { isTimeoutError, pollJob } from '@/features/dream-connect/utils/polling';

type ConnectStatus = 'idle' | 'connecting' | 'error';

interface ConnectRun {
  isCancelled: boolean;
  isNewWorld: boolean; // 새로 만든 폴더일 때만 중단 시 삭제
  worldId?: number;
  revision?: number;
}

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
// 꿈 추가(결과 화면 "+"): 기존 폴더에 새로 고른 꿈은 넣고, 체크를 푼 꿈은 뺀 뒤 3) · 4)
// cancel(): X 버튼 → 상태 확인을 멈추고, 새로 만든 폴더였다면 삭제해서 연결 중단
//   (꿈 추가 중 중단하면 기존 연결 결과는 그대로 남음)
export const useConnectDreams = (onCompleted: (worldId: number) => void) => {
  const [status, setStatus] = useState<ConnectStatus>('idle');

  // 진행 중인 연결 정보 (중단할 때 삭제하려고 보관)
  const runRef = useRef<ConnectRun | null>(null);

  const cancel = useCallback(() => {
    const run = runRef.current;
    if (!run) return;

    run.isCancelled = true;
    runRef.current = null;
    setStatus('idle');

    if (run.isNewWorld && run.worldId !== undefined && run.revision !== undefined) {
      // 실패해도 화면은 이미 닫혔으니 조용히 넘어감
      deleteWorld(run.worldId, run.revision).catch(() => {});
    }
  }, []);

  // 화면을 벗어나면 진행 중인 연결 중단
  useEffect(() => cancel, [cancel]);

  const connect = async (dreams: ConnectableDream[], existing?: ExistingWorld) => {
    if (runRef.current) return;

    const run: ConnectRun = { isCancelled: false, isNewWorld: !existing };
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
      const { compositionRevision } = await getComposition(world.worldId);

      try {
        await startComposition(world.worldId, world.revision, compositionRevision);
      } catch (error) {
        // 제한시간 초과는 서버에 접수됐을 수 있어서 다시 보내지 않고 상태 확인으로 넘어감
        if (!isTimeoutError(error)) throw error;
      }

      const composition = await pollJob({
        fetchStatus: () => getComposition(world.worldId),
        isCancelled: () => run.isCancelled,
      });
      if (!composition) return;

      runRef.current = null;
      setStatus('idle');
      onCompleted(world.worldId);
    } catch {
      if (run.isCancelled) return;
      runRef.current = null;
      setStatus('error');
    }
  };

  return { status, connect, cancel, resetError: () => setStatus('idle') };
};
