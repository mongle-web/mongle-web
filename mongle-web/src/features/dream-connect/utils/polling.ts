import { isAxiosError } from 'axios';

// 생성 상태를 몇 초마다 확인할지
export const POLLING_INTERVAL_MS = 1000;

// 상태 확인이 이 횟수만큼 연속으로 실패하면 그때 실패로 처리 (한두 번 끊기는 건 다시 확인)
// 제한시간 초과(타임아웃)는 실패로 세지 않고 계속 다시 확인
const MAX_CONSECUTIVE_ERRORS = 5;

// 이번 요청으로 시작된 작업이 이 횟수만큼 확인해도 안 보이면 접수되지 않은 것으로 보고 실패 처리
// (POST가 제한시간을 넘긴 직후에는 아직 처리 중일 수 있어서 바로 실패로 보지 않음)
const MAX_NOT_ACCEPTED_CHECKS = 10;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 공통 API 제한시간(15초)을 넘겨서 끊긴 요청인지
// AI 생성 요청은 서버에서 접수됐을 수 있으므로 다시 보내지 않고 상태 확인으로 이어감
export const isTimeoutError = (error: unknown) =>
  isAxiosError(error) && error.code === 'ECONNABORTED';

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface JobState {
  status: JobStatus;
  failureCode?: string;
}

export const isJobInProgress = ({ status }: JobState) =>
  status === 'PENDING' || status === 'PROCESSING';

interface PollJobOptions<T extends JobState> {
  fetchStatus: () => Promise<T>;
  isCancelled: () => boolean;
  // 이번 요청으로 시작된(또는 이어지는) 작업의 상태인지
  // false면 아직 접수 전이거나 이전 작업의 결과 → 완료 · 실패로 보지 않고 다시 확인
  isRequestedJob: (result: T) => boolean;
}

// 생성 작업이 끝날 때까지 상태 확인 (POST는 다시 보내지 않음)
// - COMPLETED → 결과 반환 / FAILED → 에러
// - 중간에 중단(화면 이탈 · X)되면 null
export const pollJob = async <T extends JobState>({
  fetchStatus,
  isCancelled,
  isRequestedJob,
}: PollJobOptions<T>): Promise<T | null> => {
  let errorCount = 0;
  let notAcceptedCount = 0;

  while (!isCancelled()) {
    await sleep(POLLING_INTERVAL_MS);

    let result: T;
    try {
      result = await fetchStatus();
      errorCount = 0;
    } catch (error) {
      if (isTimeoutError(error)) continue;

      errorCount += 1;
      if (errorCount >= MAX_CONSECUTIVE_ERRORS) throw error;
      continue;
    }

    if (isCancelled()) return null;

    if (!isRequestedJob(result)) {
      notAcceptedCount += 1;
      if (notAcceptedCount >= MAX_NOT_ACCEPTED_CHECKS) throw new Error('NOT_ACCEPTED');
      continue;
    }

    if (result.status === 'COMPLETED') return result;
    if (result.status === 'FAILED') throw new Error(result.failureCode);
  }

  return null;
};
