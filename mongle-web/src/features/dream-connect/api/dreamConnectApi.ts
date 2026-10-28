// import { apiClient } from '@/api/client';
import {
  addDreamToWorldMock,
  createWorldMock,
  deleteWorldMock,
  getCompositionMock,
  getConnectableDreamsMock,
  startCompositionMock,
} from '@/features/dream-connect/mocks/dreamConnectMockData';
import type {
  ConnectSort,
  ConnectableDream,
  WorldComposition,
  WorldFolder,
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

// 세계관에 꿈 넣기 (한 번에 하나씩, 매번 최신 revision 전달)
// TODO: PUT /api/v1/worlds/{worldId}/dreams/{dreamId}  body { revision }
export const addDreamToWorld = async (
  worldId: number,
  // 실제 API에서 사용 (Mock은 개수만 셈)
  _dreamId: number,
  revision: number,
): Promise<WorldFolder> => {
  await wait(100);
  const world = addDreamToWorldMock(worldId, revision);
  if (!world) throw new Error('꿈을 연결 목록에 넣지 못했어요.');
  return world;
};

// 연결 생성 시작 (접수만 하고 바로 응답, 완료 여부는 getComposition으로 확인)
// TODO: POST /api/v1/worlds/{worldId}/composition  body { folderRevision, compositionRevision: 0 }
export const startComposition = async (
  worldId: number,
  // 실제 API에서 사용
  _folderRevision: number,
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
