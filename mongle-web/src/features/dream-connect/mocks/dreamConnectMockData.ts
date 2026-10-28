import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import type {
  ConnectSort,
  ConnectableDream,
  WorldComposition,
  WorldFolder,
} from '@/features/dream-connect/types/dreamConnect';

// 개발용 Mock 데이터 (스웨거 응답 모양을 그대로 흉내)
// 꿈 목록은 캘린더 Mock(calendarMockDreams)을 그대로 사용
// TODO: 백엔드 API 연동 후 삭제

export const getConnectableDreamsMock = (sort: ConnectSort): ConnectableDream[] => {
  const dreams = calendarMockDreams.map(({ id, date, title }) => ({
    dreamId: id,
    dreamedAt: date,
    title,
  }));

  return dreams.sort((a, b) =>
    sort === 'LATEST'
      ? b.dreamedAt.localeCompare(a.dreamedAt)
      : a.dreamedAt.localeCompare(b.dreamedAt),
  );
};

// 만든 세계관 · 생성 시작 시각 보관 (새로고침하면 초기화)
const worlds = new Map<number, WorldFolder & { startedAt?: number }>();
let nextWorldId = 1;

// 연결 생성에 걸리는 시간 (로딩 모달 확인용)
const COMPOSITION_DURATION_MS = 3000;

export const createWorldMock = (name: string): WorldFolder => {
  const world = { worldId: nextWorldId++, name, selectedDreamCount: 0, revision: 0 };
  worlds.set(world.worldId, world);
  return world;
};

export const addDreamToWorldMock = (worldId: number, revision: number): WorldFolder | undefined => {
  const world = worlds.get(worldId);
  if (!world || world.revision !== revision) return undefined;

  world.selectedDreamCount += 1;
  world.revision += 1;
  return { ...world };
};

export const startCompositionMock = (worldId: number): WorldComposition | undefined => {
  const world = worlds.get(worldId);
  if (!world) return undefined;

  world.startedAt = Date.now();
  return { worldId, status: 'PENDING' };
};

export const getCompositionMock = (worldId: number): WorldComposition | undefined => {
  const world = worlds.get(worldId);
  if (!world) return undefined;
  if (!world.startedAt) return { worldId, status: 'PENDING' };

  const isDone = Date.now() - world.startedAt >= COMPOSITION_DURATION_MS;
  return { worldId, status: isDone ? 'COMPLETED' : 'PROCESSING' };
};

export const deleteWorldMock = (worldId: number) => {
  worlds.delete(worldId);
};
