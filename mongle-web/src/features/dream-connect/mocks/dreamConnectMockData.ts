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
const MOCK_EMOTIONS = [
  { code: 'ANXIOUS', label: '불안함' },
  { code: 'CONFUSED', label: '당황스러움' },
  { code: 'EXCITED', label: '긴장감' },
];
const MOCK_GENERATED_TITLE = '길을 잃은 끝에 만난 하늘';

interface MockWorld extends WorldFolder {
  createdAt: string; // 'YYYY-MM-DD'
  dreamIds: number[];
  compositionRevision: number;
  hasResult: boolean;
  jobVersion: number;
  startedAt?: number;
  generatedTitle?: string; // AI 제목 (요약이 완성되면 생김)
  summaryStartedAt?: number; // 요약 생성 시작 시각 (연결이 완성되면 자동 시작)
}

// 만든 세계관 보관 (새로고침하면 초기화)
const worlds = new Map<number, MockWorld>();
let nextWorldId = 1;

// 오늘에서 며칠 전 날짜 ('YYYY-MM-DD')
const daysAgo = (days: number) => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

// 보관함 "연결된 꿈" 탭 확인용으로 미리 만들어 둔 연결 결과 (꿈 id는 캘린더 Mock 기준)
const seedWorld = (
  name: string,
  generatedTitle: string,
  dreamIds: number[],
  createdDaysAgo: number,
) => {
  const world: MockWorld = {
    worldId: nextWorldId++,
    name,
    selectedDreamCount: dreamIds.length,
    revision: dreamIds.length,
    createdAt: daysAgo(createdDaysAgo),
    dreamIds,
    compositionRevision: 1,
    hasResult: true,
    jobVersion: 1,
    generatedTitle,
  };
  worlds.set(world.worldId, world);
};

seedWorld('파도 너머의 밤 외 4개', '별이 쏟아지는 학교', [5, 1, 3, 6, 2], 1);
seedWorld('끝없이 이어지는 계단 외 1개', '계단 끝의 회의실', [2, 4], 5);

// 연결 생성에 걸리는 시간 (로딩 모달 확인용)
const COMPOSITION_DURATION_MS = 3000;

// 요약(AI 제목 · 키워드 · 감정) 생성에 걸리는 시간 (결과 화면에서 늦게 바뀌는 것 확인용)
const SUMMARY_DURATION_MS = 3000;

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
    createdAt: daysAgo(0),
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
    world.summaryStartedAt = Date.now(); // 연결이 완성되면 요약 생성 자동 시작
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
    dreams,
  };
};

export const deleteWorldMock = (worldId: number) => {
  worlds.delete(worldId);
};

// 세계관 요약 (스웨거 WorldSummaryResponse 모양)
// 요약을 만드는 중에도 이전에 완성된 요약이 있으면 그 값을 같이 내려줌 (hasPreviousResult)
export const getWorldSummaryMock = (worldId: number) => {
  const world = worlds.get(worldId);
  if (!world) return undefined;

  if (world.summaryStartedAt && Date.now() - world.summaryStartedAt >= SUMMARY_DURATION_MS) {
    world.summaryStartedAt = undefined;
    world.generatedTitle = world.generatedTitle ?? MOCK_GENERATED_TITLE;
  }

  const hasTitle = world.generatedTitle !== undefined;
  const status = world.summaryStartedAt ? 'PROCESSING' : hasTitle ? 'COMPLETED' : 'NOT_GENERATED';

  return {
    worldId,
    status,
    generatedTitle: world.generatedTitle ?? null,
    commonKeywords: hasTitle ? MOCK_KEYWORDS.map((keyword) => ({ keyword, dreamCount: 2 })) : [],
    recurringEmotions: hasTitle
      ? MOCK_EMOTIONS.map((emotion) => ({ ...emotion, dreamCount: 2 }))
      : [],
    hasPreviousResult: Boolean(world.summaryStartedAt) && hasTitle,
  } as const;
};

// 세계관 요약 생성 요청 (생성 중이면 그대로 두고, 아니면 새로 시작)
export const requestWorldSummaryMock = (worldId: number) => {
  const world = worlds.get(worldId);
  if (!world || !world.hasResult) return undefined;

  world.summaryStartedAt = world.summaryStartedAt ?? Date.now();
  return getWorldSummaryMock(worldId);
};

// 내 세계관 목록 (스웨거 GET /api/v1/worlds 의 items 모양, 빈 폴더도 포함)
export const getWorldListMock = () =>
  [...worlds.values()].map((world) => {
    const dreams = calendarMockDreams
      .filter((dream) => world.hasResult && world.dreamIds.includes(dream.id))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      worldId: world.worldId,
      name: world.name,
      revision: world.revision,
      createdAt: `${world.createdAt}T09:00:00`,
      composedDreamCount: dreams.length, // 완성본에 들어간 꿈 수
      // 완성본에서 가장 오래된 꿈 (완성본이 없으면 null)
      representativeDream: dreams[0] ? { title: dreams[0].title, dreamedAt: dreams[0].date } : null,
      summary: getWorldSummaryMock(world.worldId) ?? null,
    };
  });

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
