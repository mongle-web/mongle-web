import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import { IMAGE_TOKEN_COST, MIN_CONNECT_DREAMS } from '@/features/dream-connect/types/dreamConnect';
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
  composedDreamIds: number[]; // 완성본(이야기)에 들어간 꿈 (연결이 완성될 때의 선택 목록)
  generatedTitle?: string; // AI 제목 (요약이 완성되면 생김)
  summaryDreamIds?: number[]; // 요약을 만들 때 쓴 꿈
  summaryStartedAt?: number; // 요약 생성 시작 시각 (연결이 완성되면 자동 시작)
}

// 원본이 지워지지 않고 남아 있는 꿈만 (백엔드: 원본 꿈을 지우면 완성본에서도 그 꿈의 이야기를 뺌)
const existingDreams = (dreamIds: number[]) =>
  calendarMockDreams
    .filter((dream) => dreamIds.includes(dream.id))
    .sort((a, b) => a.date.localeCompare(b.date));

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
    composedDreamIds: dreamIds,
    generatedTitle,
    summaryDreamIds: dreamIds,
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
    composedDreamIds: [],
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
    world.composedDreamIds = [...world.dreamIds];
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

  return {
    worldId,
    name: world.name,
    story: MOCK_STORY,
    dreams: existingDreams(world.dreamIds).map(toConnectableDream),
    composedDreamCount: existingDreams(world.composedDreamIds).length,
  };
};

export const deleteWorldMock = (worldId: number) => {
  worlds.delete(worldId);
};

// 세계관 요약 (스웨거 WorldSummaryResponse 모양)
// - 요약을 만드는 중에도 이전에 완성된 요약이 있으면 그 값을 같이 내려줌 (hasPreviousResult)
// - 요약에 쓴 꿈의 원본이 지워지면 요약을 지우고 자동으로 다시 만들지 않음 (백엔드 정책)
// - 남은 꿈이 1개면 제목만 만들고 공통 키워드 · 반복 감정은 빈 배열, 0개면 EMPTY
export const getWorldSummaryMock = (worldId: number) => {
  const world = worlds.get(worldId);
  if (!world) return undefined;

  const composedCount = existingDreams(world.composedDreamIds).length;

  if (world.summaryStartedAt && Date.now() - world.summaryStartedAt >= SUMMARY_DURATION_MS) {
    world.summaryStartedAt = undefined;
    world.generatedTitle = world.generatedTitle ?? MOCK_GENERATED_TITLE;
    // 지금 남아 있는 꿈으로만 요약을 만듦
    world.summaryDreamIds = existingDreams(world.composedDreamIds).map((dream) => dream.id);
  }

  const isSourceDeleted = (world.summaryDreamIds ?? []).some(
    (dreamId) => !calendarMockDreams.some((dream) => dream.id === dreamId),
  );
  if (isSourceDeleted && !world.summaryStartedAt) {
    world.generatedTitle = undefined;
    world.summaryDreamIds = undefined;
  }

  const hasTitle = world.generatedTitle !== undefined;
  const hasRepeats = hasTitle && (world.summaryDreamIds?.length ?? 0) >= MIN_CONNECT_DREAMS;
  const status = (() => {
    if (world.summaryStartedAt) return 'PROCESSING';
    if (hasTitle) return 'COMPLETED';
    if (world.hasResult && composedCount === 0) return 'EMPTY';
    return 'NOT_GENERATED';
  })();

  return {
    worldId,
    status,
    generatedTitle: world.generatedTitle ?? null,
    commonKeywords: hasRepeats ? MOCK_KEYWORDS.map((keyword) => ({ keyword, dreamCount: 2 })) : [],
    recurringEmotions: hasRepeats
      ? MOCK_EMOTIONS.map((emotion) => ({ ...emotion, dreamCount: 2 }))
      : [],
    hasPreviousResult: Boolean(world.summaryStartedAt) && hasTitle,
  } as const;
};

// 세계관 요약 생성 요청 (생성 중이면 그대로 두고, 아니면 새로 시작)
export const requestWorldSummaryMock = (worldId: number) => {
  const world = worlds.get(worldId);
  if (!world || !world.hasResult) return undefined;

  // 남은 꿈이 없으면 AI를 부르지 않음 (EMPTY)
  if (existingDreams(world.composedDreamIds).length > 0) {
    world.generatedTitle = undefined;
    world.summaryStartedAt = world.summaryStartedAt ?? Date.now();
  }
  return getWorldSummaryMock(worldId);
};

// 내 세계관 목록 (스웨거 GET /api/v1/worlds 의 items 모양, 빈 폴더도 포함)
export const getWorldListMock = () =>
  [...worlds.values()].map((world) => {
    const dreams = world.hasResult ? existingDreams(world.composedDreamIds) : [];

    return {
      worldId: world.worldId,
      name: world.name,
      revision: world.revision,
      createdAt: `${world.createdAt}T09:00:00`,
      composedDreamCount: dreams.length, // 지금 완성본에 남아 있는 꿈 수
      // 완성본에 남은 꿈 중 가장 오래된 꿈 (지우면 다음 꿈으로 바뀜, 없으면 null)
      representativeDream: dreams[0] ? { title: dreams[0].title, dreamedAt: dreams[0].date } : null,
      summary: getWorldSummaryMock(world.worldId) ?? null,
    };
  });

// 세계관 이미지 (생성 시작 시각 보관)
const worldImages = new Map<number, { startedAt: number; imageVersion: number }>();

// 이미지 생성에 걸리는 시간 (로딩 모달 확인용)
const IMAGE_DURATION_MS = 3000;

// 보유 토큰 (Mock, 충전 상품 1개 = 10크레딧 기준)
let mockCredits = 10;

export const getCreditBalanceMock = () => mockCredits;

export const createWorldImageMock = (worldId: number): WorldImage | undefined => {
  const world = worlds.get(worldId);
  // 완성본에 남은 꿈이 2개 미만이면 새 이미지 생성 불가 (백엔드 정책)
  if (!world || mockCredits < IMAGE_TOKEN_COST) return undefined;
  if (existingDreams(world.composedDreamIds).length < MIN_CONNECT_DREAMS) return undefined;

  const previous = worldImages.get(worldId);
  const image = { startedAt: Date.now(), imageVersion: (previous?.imageVersion ?? 0) + 1 };
  worldImages.set(worldId, image);
  mockCredits -= IMAGE_TOKEN_COST;
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
