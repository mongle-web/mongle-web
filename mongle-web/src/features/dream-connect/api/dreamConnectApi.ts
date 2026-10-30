import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import type {
  ConnectSort,
  ConnectableDream,
  WorldComposition,
  WorldFolder,
  WorldImage,
  WorldResult,
  WorldSummary,
} from '@/features/dream-connect/types/dreamConnect';
import { UNTITLED_DREAM_TITLE } from '@/features/dream-detail/types/dreamDetail';

// 한 번에 받을 최대 개수 (백엔드 최대 50)
const PAGE_SIZE = 50;

// 공통 응답({ success, code, message, data })에서 data만 꺼내기
const getData = async <T>(url: string, params?: object) =>
  (await apiClient.get<ApiResponse<T>>(url, { params })).data.data;

// ---------------- 백엔드 응답 (스웨거, 화면에 쓰는 필드만) ----------------

interface ArchivePageResponse {
  items: {
    dreamId: number;
    dreamedAt: string;
    title: string | null;
    story: { hasResult: boolean } | null; // AI 이야기 (아직 만들지 않았으면 null)
  }[];
  hasNext: boolean;
  nextCursor?: string;
}

interface WorldCompositionResponse {
  worldId: number;
  compositionRevision: number;
  status: WorldComposition['status'];
  failureCode?: string | null;
  attemptId: string | null;
  jobVersion: number;
  hasConnectionGaps: boolean;
}

interface WorldEntryPageResponse {
  items: {
    dreamId: number;
    bridgeBefore: string | null; // 앞 꿈과 이어 주는 문장 (첫 꿈 · 끊긴 자리는 없음)
    sections: { sequence: number; content: string }[];
    connectionGap: boolean; // 앞 꿈이 삭제돼서 연결이 끊긴 자리
  }[];
  hasNext: boolean;
  nextCursor?: string;
}

interface SelectedDreamPageResponse {
  items: { dreamId: number; dreamedAt: string; title: string | null }[];
  hasNext: boolean;
  nextCursor?: string;
}

interface WorldSummaryResponse {
  status: WorldSummary['status'];
  generatedTitle: string | null;
  commonKeywords: { keyword: string }[];
  recurringEmotions: { label: string }[];
  hasPreviousResult: boolean;
}

interface WorldImageResponse {
  worldId: number;
  imageVersion: number;
  status: WorldImage['status'];
  failureCode?: string | null;
  hasPreviousResult: boolean;
  nextRegenerationCost: number | null;
  compositionChanged: boolean;
  sourceDeleted: boolean;
}

const toComposition = (data: WorldCompositionResponse): WorldComposition => ({
  worldId: data.worldId,
  status: data.status,
  compositionRevision: data.compositionRevision,
  attemptId: data.attemptId,
  jobVersion: data.jobVersion,
  failureCode: data.failureCode ?? undefined,
  hasConnectionGaps: data.hasConnectionGaps,
});

const toWorldImage = (data: WorldImageResponse): WorldImage => ({
  worldId: data.worldId,
  status: data.status,
  imageVersion: data.imageVersion,
  failureCode: data.failureCode ?? undefined,
  hasPreviousResult: data.hasPreviousResult,
  nextRegenerationCost: data.nextRegenerationCost,
  compositionChanged: data.compositionChanged,
  sourceDeleted: data.sourceDeleted,
});

// ---------------- API ----------------

// 연결할 꿈 목록 (감정 선택까지 끝낸 꿈, 다음 페이지가 없을 때까지 전부 받음)
// AI 이야기가 완성된 꿈만 (백엔드: 연결하려면 꿈마다 완성된 서사가 필요, 없으면 연결 요청이 거절됨)
//   이야기를 만드는 중이거나 실패한 꿈은 빼고, 완성되면 목록에 나타남
export const getConnectableDreams = async (sort: ConnectSort): Promise<ConnectableDream[]> => {
  const dreams: ConnectableDream[] = [];
  let cursor: string | undefined;

  do {
    const page = await getData<ArchivePageResponse>('/api/v1/archives', {
      sort,
      size: PAGE_SIZE,
      cursor,
    });

    dreams.push(
      ...page.items
        .filter(({ story }) => story?.hasResult)
        .map(({ dreamId, dreamedAt, title }) => ({
          dreamId,
          dreamedAt,
          title: title || UNTITLED_DREAM_TITLE,
        })),
    );
    cursor = page.hasNext ? page.nextCursor : undefined;
  } while (cursor);

  return dreams;
};

// 세계관(꿈 연결) 폴더 만들기 (POST /api/v1/worlds)
export const createWorld = async (name: string): Promise<WorldFolder> => {
  const { data } = await apiClient.post<ApiResponse<WorldFolder>>('/api/v1/worlds', { name });
  return data.data;
};

// 세계관 폴더 정보 (최신 revision 확인용, GET /api/v1/worlds/{worldId})
export const getWorld = async (worldId: number): Promise<WorldFolder> => {
  return getData<WorldFolder>(`/api/v1/worlds/${worldId}`);
};

// 세계관에 꿈 넣기 (한 번에 하나씩, 매번 최신 revision 전달)
// PUT /api/v1/worlds/{worldId}/dreams/{dreamId}  body { revision }
export const addDreamToWorld = async (
  worldId: number,
  dreamId: number,
  revision: number,
): Promise<WorldFolder> => {
  const { data } = await apiClient.put<ApiResponse<WorldFolder>>(
    `/api/v1/worlds/${worldId}/dreams/${dreamId}`,
    { revision },
  );
  return data.data;
};

// 세계관에서 꿈 빼기 (원본 꿈은 지워지지 않음)
// DELETE /api/v1/worlds/{worldId}/dreams/{dreamId}?revision={revision}
export const removeDreamFromWorld = async (
  worldId: number,
  dreamId: number,
  revision: number,
): Promise<WorldFolder> => {
  const { data } = await apiClient.delete<ApiResponse<WorldFolder>>(
    `/api/v1/worlds/${worldId}/dreams/${dreamId}`,
    { params: { revision } },
  );
  return data.data;
};

// 연결 생성 시작 (접수만 하고 바로 응답, 완료 여부는 getComposition으로 확인)
// 제한시간 초과 시 다시 보내지 말고 getComposition으로 상태 확인 (useConnectDreams)
// POST /api/v1/worlds/{worldId}/composition  body { folderRevision, compositionRevision } (크레딧 사용 없음)
// 원본 꿈 삭제로 끊긴 연결을 다시 이을 때("내용 재생성")도 같은 API 사용
export const startComposition = async (
  worldId: number,
  folderRevision: number,
  compositionRevision: number,
): Promise<void> => {
  await apiClient.post(`/api/v1/worlds/${worldId}/composition`, {
    folderRevision,
    compositionRevision,
  });
};

// 연결 생성 상태 확인 (GET /api/v1/worlds/{worldId}/composition)
export const getComposition = async (worldId: number): Promise<WorldComposition> => {
  return toComposition(
    await getData<WorldCompositionResponse>(`/api/v1/worlds/${worldId}/composition`),
  );
};

// 완성본 이야기 전체 (GET /api/v1/worlds/{worldId}/composition/entries, 날짜순)
const getAllEntries = async (worldId: number) => {
  const entries: WorldEntryPageResponse['items'] = [];
  let cursor: string | undefined;

  do {
    const page = await getData<WorldEntryPageResponse>(
      `/api/v1/worlds/${worldId}/composition/entries`,
      { size: PAGE_SIZE, cursor },
    );
    entries.push(...page.items);
    cursor = page.hasNext ? page.nextCursor : undefined;
  } while (cursor);

  return entries;
};

// 연결된 꿈 전체 (GET /api/v1/worlds/{worldId}/dreams, 날짜순)
const getAllSelectedDreams = async (worldId: number) => {
  const dreams: ConnectableDream[] = [];
  let cursor: string | undefined;

  do {
    const page = await getData<SelectedDreamPageResponse>(`/api/v1/worlds/${worldId}/dreams`, {
      size: PAGE_SIZE,
      cursor,
    });
    dreams.push(
      ...page.items.map(({ dreamId, dreamedAt, title }) => ({
        dreamId,
        dreamedAt,
        title: title || UNTITLED_DREAM_TITLE,
      })),
    );
    cursor = page.hasNext ? page.nextCursor : undefined;
  } while (cursor);

  return dreams;
};

// 연결 결과 (폴더 이름 · 스토리 · 연결된 꿈 · 완성본에 남은 꿈 수)
// - 스토리: 꿈마다 한 문단 (앞 꿈과 이어 주는 문장 + 그 꿈 이야기)
//   원본 꿈을 지우면 그 꿈 이야기와 앞뒤 연결 문장이 빠짐 (끊긴 자리는 따로 표시하지 않음, 디자이너 확인)
// - 완성본에 남은 꿈 수: entries 의 서로 다른 dreamId 개수 (이미지 생성 가능 여부 판단, 선택한 꿈 수와 다름)
export const getWorldResult = async (worldId: number): Promise<WorldResult> => {
  const [world, entries, dreams] = await Promise.all([
    getWorld(worldId),
    getAllEntries(worldId),
    getAllSelectedDreams(worldId),
  ]);

  const story = entries.map(({ bridgeBefore, sections }) =>
    [
      bridgeBefore,
      ...[...sections].sort((a, b) => a.sequence - b.sequence).map(({ content }) => content),
    ]
      .filter(Boolean)
      .join(' '),
  );

  return {
    worldId,
    name: world.name,
    story,
    dreams,
    composedDreamCount: new Set(entries.map(({ dreamId }) => dreamId)).size,
  };
};

// 세계관 요약 (AI 제목 · 공통 키워드 · 반복되는 감정)
// 연결이 완성되면 서버가 자동으로 만들기 시작함 (조회는 AI 호출 · 토큰 사용 없음)
// GET /api/v1/worlds/{worldId}/summary (keyword · label 이름 주의: 월별 통계의 name · emotion과 다름, 백엔드 #107)
export const getWorldSummary = async (worldId: number): Promise<WorldSummary> => {
  const data = await getData<WorldSummaryResponse>(`/api/v1/worlds/${worldId}/summary`);

  return {
    status: data.status,
    generatedTitle: data.generatedTitle,
    commonKeywords: data.commonKeywords.map(({ keyword }) => keyword),
    recurringEmotions: data.recurringEmotions.map(({ label }) => label),
    hasPreviousResult: data.hasPreviousResult,
  };
};

// 세계관 요약 생성 요청 (무료, 같은 요청이 진행 중이면 서버가 이어서 처리)
// 요약이 한 번도 만들어지지 않은 세계관(NOT_GENERATED)일 때 사용, 접수 후 getWorldSummary로 상태 확인
// POST /api/v1/worlds/{worldId}/summary (요청 본문 없음)
export const requestWorldSummary = async (worldId: number): Promise<void> => {
  await apiClient.post(`/api/v1/worlds/${worldId}/summary`);
};

// 세계관 폴더 삭제 (연결 중단 · 보관함에서 삭제, 원본 꿈은 지워지지 않음)
// DELETE /api/v1/worlds/{worldId}?revision={revision}
export const deleteWorld = async (worldId: number, revision: number): Promise<void> => {
  await apiClient.delete(`/api/v1/worlds/${worldId}`, { params: { revision } });
};

// 보유 토큰(크레딧) 수 (GET /api/v1/credits/balance 의 available)
export const getCreditBalance = async (): Promise<number> => {
  return (await getData<{ available: number }>('/api/v1/credits/balance')).available;
};

// 세계관 이미지 생성 시작 (접수만 하고 바로 응답, 완료 여부는 getWorldImage로 확인)
// POST /api/v1/worlds/{worldId}/image  body { compositionRevision, style, (재생성이면 regenerate · imageVersion) }
//   - style: 화풍 4종 key (surrealism · geometric-cubism · expressive-brushwork · modern-pop-art), mood는 보내지 않음
//   - 이전에 성공한 이미지가 있으면 재생성 (최신 imageVersion 함께 전달)
//   응답이 15초를 넘길 수 있음 → 제한시간 초과 시 다시 보내지 말고 getWorldImage로 상태 확인 (useCreateWorldImage)
export const createWorldImage = async (
  worldId: number,
  compositionRevision: number,
  style: string,
  previous: WorldImage | null,
): Promise<void> => {
  const isRegeneration = Boolean(
    previous && (previous.status === 'COMPLETED' || previous.hasPreviousResult),
  );

  await apiClient.post(`/api/v1/worlds/${worldId}/image`, {
    compositionRevision,
    style,
    ...(isRegeneration && previous && { regenerate: true, imageVersion: previous.imageVersion }),
  });
};

// 세계관 이미지 생성 상태 확인 (GET /api/v1/worlds/{worldId}/image)
export const getWorldImage = async (worldId: number): Promise<WorldImage> => {
  return toWorldImage(await getData<WorldImageResponse>(`/api/v1/worlds/${worldId}/image`));
};

// 완성된 세계관 이미지 주소 (최대 5분 동안 유효한 임시 주소)
// GET /api/v1/worlds/{worldId}/image/download-url 의 url
export const getWorldImageUrl = async (worldId: number): Promise<string> => {
  return (await getData<{ url: string }>(`/api/v1/worlds/${worldId}/image/download-url`)).url;
};

// 화풍 선택 화면에 보여줄 화풍 목록 (꿈 기록과 같은 API)
export const getImageStyles = async (): Promise<string[]> => {
  return (await getData<{ styles: string[] }>('/api/v1/image-options')).styles;
};
