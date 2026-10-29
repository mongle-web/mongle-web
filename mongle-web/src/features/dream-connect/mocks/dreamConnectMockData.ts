import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import type {
  ConnectSort,
  ConnectableDream,
  WorldComposition,
  WorldFolder,
  WorldImage,
  WorldResult,
} from '@/features/dream-connect/types/dreamConnect';

// 개발용 Mock 데이터 (스웨거 응답 모양을 그대로 흉내)
// 꿈 목록은 캘린더 Mock(calendarMockDreams)을 그대로 사용
// TODO: 백엔드 API 연동 후 삭제

const toConnectableDream = ({ id, date, title }: (typeof calendarMockDreams)[number]) => ({
  dreamId: id,
  dreamedAt: date,
  title,
});

export const getConnectableDreamsMock = (sort: ConnectSort): ConnectableDream[] => {
  const dreams = calendarMockDreams.map(toConnectableDream);

  return dreams.sort((a, b) =>
    sort === 'LATEST'
      ? b.dreamedAt.localeCompare(a.dreamedAt)
      : a.dreamedAt.localeCompare(b.dreamedAt),
  );
};

// 피그마 예시 문구 (연결 결과 화면 확인용)
const MOCK_STORY = [
  '학교에 늦을까 봐 서둘러 길을 나섰지만, 아무리 걸어도 익숙한 길이 나오지 않았다. 어느새 주변에는 비가 내리기 시작했고, 우산도 없이 낯선 골목을 계속 걸었다.',
  '한참을 헤매다 골목 끝에서 작은 문 하나를 발견했다. 문을 열자 비는 멈추고, 눈앞에 끝없이 펼쳐진 구름과 푸른 하늘이 나타났다.',
  '조심스럽게 발을 내딛는 순간 몸이 가볍게 떠올랐다. 더 이상 어디로 가야 할지 고민하지 않아도 됐다. 나는 구름 사이를 천천히 날아가며 처음으로 시간에 쫓기지 않는 기분을 느꼈다.',
];
const MOCK_KEYWORDS = ['회사', '회의', '출근', '엘리베이터'];
const MOCK_EMOTIONS = ['불안함', '당황스러움', '긴장감'];

interface MockWorld extends WorldFolder {
  dreamIds: number[];
  compositionRevision: number;
  hasResult: boolean;
  jobVersion: number;
  startedAt?: number;
}

// 만든 세계관 보관 (새로고침하면 초기화)
const worlds = new Map<number, MockWorld>();
let nextWorldId = 1;

// 연결 생성에 걸리는 시간 (로딩 모달 확인용)
const COMPOSITION_DURATION_MS = 3000;

const toFolder = ({ worldId, name, selectedDreamCount, revision }: MockWorld): WorldFolder => ({
  worldId,
  name,
  selectedDreamCount,
  revision,
});

export const createWorldMock = (name: string): WorldFolder => {
  const world: MockWorld = {
    worldId: nextWorldId++,
    name,
    selectedDreamCount: 0,
    revision: 0,
    dreamIds: [],
    compositionRevision: 0,
    hasResult: false,
    jobVersion: 0,
  };
  worlds.set(world.worldId, world);
  return toFolder(world);
};

export const getWorldMock = (worldId: number) => {
  const world = worlds.get(worldId);
  return world && toFolder(world);
};

export const addDreamToWorldMock = (worldId: number, dreamId: number, revision: number) => {
  const world = worlds.get(worldId);
  if (!world || world.revision !== revision) return undefined;

  if (!world.dreamIds.includes(dreamId)) {
    world.dreamIds.push(dreamId);
    world.selectedDreamCount += 1;
    world.revision += 1;
  }
  return toFolder(world);
};

export const removeDreamFromWorldMock = (worldId: number, dreamId: number, revision: number) => {
  const world = worlds.get(worldId);
  if (!world || world.revision !== revision) return undefined;

  if (world.dreamIds.includes(dreamId)) {
    world.dreamIds = world.dreamIds.filter((id) => id !== dreamId);
    world.selectedDreamCount -= 1;
    world.revision += 1;
  }
  return toFolder(world);
};

export const startCompositionMock = (worldId: number): WorldComposition | undefined => {
  const world = worlds.get(worldId);
  if (!world) return undefined;

  world.startedAt = Date.now();
  world.jobVersion += 1;
  return {
    worldId,
    status: 'PENDING',
    compositionRevision: world.compositionRevision,
    attemptId: `attempt-${world.jobVersion}`,
    jobVersion: world.jobVersion,
  };
};

export const getCompositionMock = (worldId: number): WorldComposition | undefined => {
  const world = worlds.get(worldId);
  if (!world) return undefined;

  if (world.startedAt && Date.now() - world.startedAt >= COMPOSITION_DURATION_MS) {
    world.startedAt = undefined;
    world.hasResult = true;
    world.compositionRevision += 1;
  }

  const status = world.startedAt ? 'PROCESSING' : world.hasResult ? 'COMPLETED' : 'PENDING';
  return {
    worldId,
    status,
    compositionRevision: world.compositionRevision,
    attemptId: world.jobVersion > 0 ? `attempt-${world.jobVersion}` : null,
    jobVersion: world.jobVersion,
  };
};

export const getWorldResultMock = (worldId: number): WorldResult | undefined => {
  const world = worlds.get(worldId);
  if (!world || !world.hasResult) return undefined;

  const dreams = calendarMockDreams
    .filter((dream) => world.dreamIds.includes(dream.id))
    .map(toConnectableDream)
    .sort((a, b) => a.dreamedAt.localeCompare(b.dreamedAt));

  return {
    worldId,
    name: world.name,
    story: MOCK_STORY,
    commonKeywords: MOCK_KEYWORDS,
    repeatedEmotions: MOCK_EMOTIONS,
    dreams,
  };
};

export const deleteWorldMock = (worldId: number) => {
  worlds.delete(worldId);
};

// 세계관 이미지 (생성 시작 시각 보관)
const worldImages = new Map<number, { startedAt: number; imageVersion: number }>();

// 이미지 생성에 걸리는 시간 (로딩 모달 확인용)
const IMAGE_DURATION_MS = 3000;

// 보유 토큰 (Mock)
let mockCredits = 3;

export const getCreditBalanceMock = () => mockCredits;

export const createWorldImageMock = (worldId: number): WorldImage | undefined => {
  if (!worlds.has(worldId) || mockCredits < 1) return undefined;

  const previous = worldImages.get(worldId);
  const image = { startedAt: Date.now(), imageVersion: (previous?.imageVersion ?? 0) + 1 };
  worldImages.set(worldId, image);
  mockCredits -= 1;
  return { worldId, status: 'PENDING', imageVersion: image.imageVersion };
};

export const getWorldImageMock = (worldId: number): WorldImage | undefined => {
  const image = worldImages.get(worldId);
  if (!image) return undefined;

  const isDone = Date.now() - image.startedAt >= IMAGE_DURATION_MS;
  return { worldId, status: isDone ? 'COMPLETED' : 'PROCESSING', imageVersion: image.imageVersion };
};

// 완성 이미지 주소 (꿈 기록 화면의 예시 이미지 사용)
export const getWorldImageUrlMock = () => `${window.location.origin}/dream-record/dream-art.png`;
