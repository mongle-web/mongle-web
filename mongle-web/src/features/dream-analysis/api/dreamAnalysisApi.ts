import type { ApiResponse } from '@/api/authApi';
import { apiClient } from '@/api/client';
import type { EmotionStat } from '@/features/dream-analysis/components/EmotionSection';
import type { KeywordStat } from '@/features/dream-analysis/components/KeywordSection';
import { emotionCodes } from '@/features/dream-record/api/dreamRecordApi';
import type { EmotionCode } from '@/features/dream-record/api/dreamRecordApi';

// 꿈 분석 기록 API (월별 키워드 · 감정 통계, 몽글의 종합 해석)

// ─────────────────────────────────────────────
// 서버 응답 형태
// ─────────────────────────────────────────────
interface MonthlyResponse {
  month: string;
  analyzedDreamCount: number;
  keywords: { name: string; dreamCount: number }[];
  emotions: { emotion: EmotionCode; dreamCount: number }[];
}

export type InterpretationStatus =
  'EMPTY' | 'NOT_GENERATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Interpretation {
  status: InterpretationStatus;
  failureCode: string | null;
  // 해석 본문 (문단 사이 빈 줄 포함, COMPLETED일 때만 있음)
  interpretation: string | null;
  // 이전 해석 이후 새 꿈이 생겨 다시 만들 수 있음 (자동 갱신하지 않음)
  refreshNeeded: boolean;
  // 해석 근거가 된 꿈이 3건 미만
  limitedEvidence: boolean;
}

// ─────────────────────────────────────────────
// 화면용 형태
// ─────────────────────────────────────────────
export interface MonthlyAnalysis {
  month: string;
  analyzedDreamCount: number;
  keywords: KeywordStat[];
  emotions: EmotionStat[];
}

// 감정 코드 → 화면 문구 (꿈 기록의 감정 선택과 같은 이름)
const EMOTION_LABELS = Object.fromEntries(
  Object.entries(emotionCodes).map(([label, code]) => [code, label]),
) as Record<EmotionCode, string>;

const toMonthlyAnalysis = (data: MonthlyResponse): MonthlyAnalysis => ({
  month: data.month,
  analyzedDreamCount: data.analyzedDreamCount,
  keywords: data.keywords.map(({ name, dreamCount }) => ({ keyword: name, count: dreamCount })),
  emotions: data.emotions.map(({ emotion, dreamCount }) => ({
    emotion: EMOTION_LABELS[emotion] ?? emotion,
    count: dreamCount,
  })),
});

// 월별 꿈 요소(키워드) · 선택 감정 통계
// month: 'YYYY-MM' (생략하면 서버 기본 월)
export const getMonthlyAnalysis = async (month?: string): Promise<MonthlyAnalysis> => {
  const response = await apiClient.get<ApiResponse<MonthlyResponse>>(
    '/api/v1/analysis-records/monthly',
    { params: month ? { month } : undefined },
  );
  return toMonthlyAnalysis(response.data.data);
};

// 종합 해석 조회 (AI 호출 없음, 생성 진행 상태 확인용)
export const getInterpretation = async (): Promise<Interpretation> => {
  const response = await apiClient.get<ApiResponse<Interpretation>>(
    '/api/v1/analysis-records/interpretation',
  );
  return response.data.data;
};

// 첫 진입 종합 해석 생성 (이미 있으면 기존 해석 재사용, 진행 중이면 PROCESSING)
export const createInterpretation = async (): Promise<Interpretation> => {
  const response = await apiClient.post<ApiResponse<Interpretation>>(
    '/api/v1/analysis-records/interpretation',
  );
  return response.data.data;
};

// 종합 해석 다시 만들기 (refreshNeeded일 때)
export const refreshInterpretation = async (): Promise<Interpretation> => {
  const response = await apiClient.post<ApiResponse<Interpretation>>(
    '/api/v1/analysis-records/interpretation/refresh',
  );
  return response.data.data;
};
