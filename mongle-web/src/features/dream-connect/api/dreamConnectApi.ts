// import { apiClient } from '@/api/client';
import {
  addDreamToWorldMock,
  createWorldImageMock,
  createWorldMock,
  deleteWorldMock,
  getCompositionMock,
  getConnectableDreamsMock,
  getCreditBalanceMock,
  getWorldImageMock,
  getWorldImageUrlMock,
  getWorldMock,
  getWorldResultMock,
  getWorldSummaryMock,
  removeDreamFromWorldMock,
  requestWorldSummaryMock,
  startCompositionMock,
} from '@/features/dream-connect/mocks/dreamConnectMockData';
import type {
  ConnectSort,
  ConnectableDream,
  WorldComposition,
  WorldFolder,
  WorldImage,
  WorldResult,
  WorldSummary,
} from '@/features/dream-connect/types/dreamConnect';

// 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// 연결할 꿈 목록 (감정 선택까지 끝낸 꿈)
// TODO: 백엔드 API 연동 시 Mock 부분을 지우고 아래 코드로 교체 (커서로 다음 페이지 이어 받기 필요)
//   const response = await apiClient.get('/api/v1/archives', { params: { sort, size: 50 } });
//   return response.data.data.items;
export const getConnectableDreams = async (sort: ConnectSort): Promise<ConnectableDream[]> => {
  await wait();
  return getConnectableDreamsMock(sort);
};

// 세계관(꿈 연결) 폴더 만들기
// TODO: POST /api/v1/worlds  body { name }
export const createWorld = async (name: string): Promise<WorldFolder> => {
  await wait();
  return createWorldMock(name);
};

// 세계관 폴더 정보 (최신 revision 확인용)
// TODO: GET /api/v1/worlds/{worldId}
export const getWorld = async (worldId: number): Promise<WorldFolder> => {
  await wait(100);
  const world = getWorldMock(worldId);
  if (!world) throw new Error('연결한 꿈을 찾지 못했어요.');
  return world;
};

// 세계관에 꿈 넣기 (한 번에 하나씩, 매번 최신 revision 전달)
// TODO: PUT /api/v1/worlds/{worldId}/dreams/{dreamId}  body { revision }
export const addDreamToWorld = async (
  worldId: number,
  dreamId: number,
  revision: number,
): Promise<WorldFolder> => {
  await wait(100);
  const world = addDreamToWorldMock(worldId, dreamId, revision);
  if (!world) throw new Error('꿈을 연결 목록에 넣지 못했어요.');
  return world;
};

// 세계관에서 꿈 빼기 (원본 꿈은 지워지지 않음)
// TODO: DELETE /api/v1/worlds/{worldId}/dreams/{dreamId}?revision={revision}
export const removeDreamFromWorld = async (
  worldId: number,
  dreamId: number,
  revision: number,
): Promise<WorldFolder> => {
  await wait(100);
  const world = removeDreamFromWorldMock(worldId, dreamId, revision);
  if (!world) throw new Error('꿈을 연결 목록에서 빼지 못했어요.');
  return world;
};

// 연결 생성 시작 (접수만 하고 바로 응답, 완료 여부는 getComposition으로 확인)
// 제한시간 초과 시 다시 보내지 말고 getComposition으로 상태 확인 (useConnectDreams)
// TODO: POST /api/v1/worlds/{worldId}/composition  body { folderRevision, compositionRevision }
export const startComposition = async (
  worldId: number,
  // 실제 API에서 사용
  _folderRevision: number,
  _compositionRevision: number,
): Promise<WorldComposition> => {
  await wait();
  const composition = startCompositionMock(worldId);
  if (!composition) throw new Error('꿈 연결을 시작하지 못했어요.');
  return composition;
};

// 연결 생성 상태 확인
// TODO: GET /api/v1/worlds/{worldId}/composition
export const getComposition = async (worldId: number): Promise<WorldComposition> => {
  await wait(100);
  const composition = getCompositionMock(worldId);
  if (!composition) throw new Error('꿈 연결 상태를 확인하지 못했어요.');
  return composition;
};

// 연결 결과 (폴더 이름 · 스토리 · 연결된 꿈)
// TODO: 백엔드 API 연동 시 아래 API 응답을 합쳐서 반환
//   - 폴더 이름: GET /api/v1/worlds/{worldId} 의 name
//   - 스토리: GET /api/v1/worlds/{worldId}/composition/entries 의 각 꿈 bridgeBefore + sections[].content
//     (원본 꿈을 지우면 그 꿈 이야기와 앞뒤 연결 문장이 빠지고 connectionGap=true, TODO: 끊긴 자리 표시는 디자인 확인 중)
//   - 연결된 꿈: GET /api/v1/worlds/{worldId}/dreams 의 items (dreamId · dreamedAt · title)
//   - 완성본에 남은 꿈 수: entries 의 서로 다른 dreamId 개수 (이미지 생성 가능 여부 판단, 선택한 꿈 수와 다름)
export const getWorldResult = async (worldId: number): Promise<WorldResult> => {
  await wait();
  const result = getWorldResultMock(worldId);
  if (!result) throw new Error('연결 결과를 찾지 못했어요.');
  return result;
};

// 세계관 요약 (AI 제목 · 공통 키워드 · 반복되는 감정)
// 연결이 완성되면 서버가 자동으로 만들기 시작함 (조회는 AI 호출 · 토큰 사용 없음)
// TODO: 백엔드 API 연동 시 Mock 부분을 지우고 아래 코드로 교체
//   const { data } = (await apiClient.get(`/api/v1/worlds/${worldId}/summary`)).data;
//   그 뒤 아래 return과 같은 방식으로 필요한 값만 꺼내서 반환
//   (keyword · label 이름 주의: 월별 통계의 name · emotion과 다름, 백엔드 #107)
export const getWorldSummary = async (worldId: number): Promise<WorldSummary> => {
  await wait(100);
  const data = getWorldSummaryMock(worldId);
  if (!data) throw new Error('세계관 요약을 찾지 못했어요.');

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
// TODO: POST /api/v1/worlds/{worldId}/summary (요청 본문 없음)
export const requestWorldSummary = async (worldId: number): Promise<void> => {
  await wait(100);
  if (!requestWorldSummaryMock(worldId)) throw new Error('세계관 요약을 요청하지 못했어요.');
};

// 세계관 폴더 삭제 (연결 중단 시 사용, 원본 꿈은 지워지지 않음)
// TODO: DELETE /api/v1/worlds/{worldId}?revision={revision}
export const deleteWorld = async (
  worldId: number,
  // 실제 API에서 사용
  _revision: number,
): Promise<void> => {
  await wait(100);
  deleteWorldMock(worldId);
};

// 보유 토큰(크레딧) 수
// TODO: GET /api/v1/credits/balance 의 available
export const getCreditBalance = async (): Promise<number> => {
  await wait(100);
  return getCreditBalanceMock();
};

// 세계관 이미지 생성 시작 (접수만 하고 바로 응답, 완료 여부는 getWorldImage로 확인)
// TODO: POST /api/v1/worlds/{worldId}/image  body { compositionRevision, style }
//   style은 사용자가 화풍 4종 중 고른 key (GET /api/v1/image-options 의 styles 에 있는 값만 사용)
//   - surrealism · geometric-cubism · expressive-brushwork · modern-pop-art
//   - 화풍 선택 화면은 디자인 요청 중, mood는 보내지 않음
//   응답이 15초를 넘길 수 있음 → 제한시간 초과 시 다시 보내지 말고 getWorldImage로 상태 확인 (useCreateWorldImage)
export const createWorldImage = async (
  worldId: number,
  // 실제 API에서 사용
  _compositionRevision: number,
): Promise<WorldImage> => {
  await wait();
  const image = createWorldImageMock(worldId);
  if (!image) throw new Error('이미지를 만들지 못했어요.');
  return image;
};

// 세계관 이미지 생성 상태 확인
// TODO: GET /api/v1/worlds/{worldId}/image
export const getWorldImage = async (worldId: number): Promise<WorldImage> => {
  await wait(100);
  const image = getWorldImageMock(worldId);
  if (!image) throw new Error('이미지 상태를 확인하지 못했어요.');
  return image;
};

// 완성된 세계관 이미지 주소 (최대 5분 동안 유효한 임시 주소)
// TODO: GET /api/v1/worlds/{worldId}/image/download-url 의 url
export const getWorldImageUrl = async (
  // 실제 API에서 사용
  _worldId: number,
): Promise<string> => {
  await wait(100);
  return getWorldImageUrlMock();
};
