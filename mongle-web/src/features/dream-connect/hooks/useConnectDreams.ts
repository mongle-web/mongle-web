import { useCallback, useEffect, useRef, useState } from 'react';

import {
  addDreamToWorld,
  createWorld,
  deleteWorld,
  getComposition,
  startComposition,
} from '@/features/dream-connect/api/dreamConnectApi';
import type { ConnectableDream } from '@/features/dream-connect/types/dreamConnect';

// 연결 상태를 몇 초마다 확인할지
const POLLING_INTERVAL_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ConnectStatus = 'idle' | 'connecting' | 'error';

// TODO: 세계관 이름은 필수인데 피그마에 입력 단계가 없어서 임시 이름 사용 (백엔드 · 기획 확인 중)
const makeWorldName = (dreams: ConnectableDream[]) => {
  const [first, ...rest] = [...dreams].sort((a, b) => a.dreamedAt.localeCompare(b.dreamedAt));
  return `${first.title} 외 ${rest.length}개`;
};

// 꿈 연결하기 전체 흐름
// 1) 세계관 폴더 만들기 → 2) 고른 꿈 하나씩 넣기 → 3) 연결 생성 시작 → 4) 완료될 때까지 상태 확인
// cancel(): X 버튼 → 상태 확인을 멈추고 만든 폴더를 삭제해서 연결 중단
export const useConnectDreams = (onCompleted: (worldId: number) => void) => {
  const [status, setStatus] = useState<ConnectStatus>('idle');

  // 진행 중인 연결 정보 (중단할 때 삭제하려고 보관)
  const runRef = useRef<{ isCancelled: boolean; worldId?: number; revision?: number } | null>(null);

  const cancel = useCallback(() => {
    const run = runRef.current;
    if (!run) return;

    run.isCancelled = true;
    runRef.current = null;
    setStatus('idle');

    if (run.worldId !== undefined && run.revision !== undefined) {
      // 실패해도 화면은 이미 닫혔으니 조용히 넘어감
      deleteWorld(run.worldId, run.revision).catch(() => {});
    }
  }, []);

  // 화면을 벗어나면 진행 중인 연결 중단
  useEffect(() => cancel, [cancel]);

  const connect = async (dreams: ConnectableDream[]) => {
    if (runRef.current) return;

    const run: { isCancelled: boolean; worldId?: number; revision?: number } = {
      isCancelled: false,
    };
    runRef.current = run;
    setStatus('connecting');

    try {
      let world = await createWorld(makeWorldName(dreams));
      run.worldId = world.worldId;
      run.revision = world.revision;

      for (const dream of dreams) {
        if (run.isCancelled) return;
        world = await addDreamToWorld(world.worldId, dream.dreamId, world.revision);
        run.revision = world.revision;
      }

      if (run.isCancelled) return;
      await startComposition(world.worldId, world.revision);

      while (!run.isCancelled) {
        const composition = await getComposition(world.worldId);
        if (run.isCancelled) return;

        if (composition.status === 'COMPLETED') {
          runRef.current = null;
          setStatus('idle');
          onCompleted(world.worldId);
          return;
        }

        if (composition.status === 'FAILED') throw new Error(composition.failureCode);

        await sleep(POLLING_INTERVAL_MS);
      }
    } catch {
      if (run.isCancelled) return;
      runRef.current = null;
      setStatus('error');
    }
  };

  return { status, connect, cancel, resetError: () => setStatus('idle') };
};
