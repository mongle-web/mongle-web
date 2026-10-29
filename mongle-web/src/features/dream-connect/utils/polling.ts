import { isAxiosError } from 'axios';

// 생성 상태를 몇 초마다 확인할지
export const POLLING_INTERVAL_MS = 1000;

// 상태 확인이 이 횟수만큼 연속으로 실패하면 그때 실패로 처리 (한두 번 끊기는 건 다시 확인)
const MAX_CONSECUTIVE_ERRORS = 5;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 공통 API 제한시간(15초)을 넘겨서 끊긴 요청인지
// AI 생성 요청은 서버에서 접수됐을 수 있으므로 다시 보내지 않고 상태 확인으로 이어감
export const isTimeoutError = (error: unknown) =>
  isAxiosError(error) && error.code === 'ECONNABORTED';

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface PollJobOptions<T extends { status: JobStatus; failureCode?: string }> {
  fetchStatus: () => Promise<T>;
  isCancelled: () => boolean;
}

// 생성 작업이 끝날 때까지 상태 확인
// - COMPLETED → 결과 반환 / FAILED → 에러
// - 중간에 중단(화면 이탈 · X)되면 null
export const pollJob = async <T extends { status: JobStatus; failureCode?: string }>({
  fetchStatus,
  isCancelled,
}: PollJobOptions<T>): Promise<T | null> => {
  let errorCount = 0;

  while (!isCancelled()) {
    await sleep(POLLING_INTERVAL_MS);

    let result: T;
    try {
      result = await fetchStatus();
      errorCount = 0;
    } catch (error) {
      errorCount += 1;
      if (errorCount >= MAX_CONSECUTIVE_ERRORS) throw error;
      continue;
    }

    if (isCancelled()) return null;
    if (result.status === 'COMPLETED') return result;
    if (result.status === 'FAILED') throw new Error(result.failureCode);
  }

  return null;
};
