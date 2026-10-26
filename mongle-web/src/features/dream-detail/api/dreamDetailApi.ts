// import { apiClient } from '@/api/client';
import { getDreamDetailMock } from '@/features/dream-detail/mocks/dreamDetailMockData';
import type { DreamDetail } from '@/features/dream-detail/types/dreamDetail';

// 찾는 꿈이 없을 때 (삭제됐거나 잘못된 주소)
export class DreamNotFoundError extends Error {
  constructor() {
    super('꿈 기록을 찾을 수 없어요.');
    this.name = 'DreamNotFoundError';
  }
}

// 꿈 상세 조회
// TODO: 백엔드 API가 나오면 아래 Mock 부분을 지우고 주석 처리된 코드로 교체
// const response = await apiClient.get<DreamDetail>(`/dreams/${dreamId}`);
// return response.data;
// (404 응답이면 DreamNotFoundError를 던지도록 처리)
export const getDreamDetail = async (dreamId: number): Promise<DreamDetail> => {
  // 실제 네트워크 요청처럼 보이도록 약간 지연 (로딩 UI 확인용)
  await new Promise((resolve) => setTimeout(resolve, 300));

  const dream = getDreamDetailMock(dreamId);
  if (!dream) throw new DreamNotFoundError();

  return dream;
};
