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
// 월별 반복 장소 · 인물 (서로 다른 꿈 2개 이상에 나온 것, 각각 최대 5개)
interface RecurringElementsResponse {
  places: { name: string; dreamCount: number }[];
  characters: { name: string; dreamCount: number }[];
}

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

// 월별 반복 장소 · 인물 (GET /api/v1/analysis-records/recurring-elements, AI 호출 · 크레딧 없음)
// 못 받아도 키워드 통계는 보여줘야 해서 실패하면 빈 목록
const getRecurringElements = async (month?: string) => {
  try {
    const response = await apiClient.get<ApiResponse<RecurringElementsResponse>>(
      '/api/v1/analysis-records/recurring-elements',
      { params: month ? { month } : undefined },
    );
    const { places, characters } = response.data.data;
    return [...places, ...characters];
  } catch {
    return [];
  }
};

// 키워드에 반복 장소 · 인물을 합침 (디자이너: 키워드 통계에 한번에 표시)
// 같은 이름이 키워드에도 있으면 하나로 합치고 더 큰 건수를 사용
const mergeKeywords = (
  keywords: MonthlyResponse['keywords'],
  elements: RecurringElementsResponse['places'],
) => {
  const counts = new Map<string, number>();
  [...keywords, ...elements].forEach(({ name, dreamCount }) => {
    counts.set(name, Math.max(counts.get(name) ?? 0, dreamCount));
  });
  return [...counts].map(([name, dreamCount]) => ({ name, dreamCount }));
};

// 월별 꿈 요소(키워드) · 선택 감정 통계 + 반복 장소 · 인물
// month: 'YYYY-MM' (생략하면 서버 기본 월, 두 API 모두 한국 시간 이번 달)
export const getMonthlyAnalysis = async (month?: string): Promise<MonthlyAnalysis> => {
  const [response, elements] = await Promise.all([
    apiClient.get<ApiResponse<MonthlyResponse>>('/api/v1/analysis-records/monthly', {
      params: month ? { month } : undefined,
    }),
    getRecurringElements(month),
  ]);
  const data = response.data.data;

  return toMonthlyAnalysis({ ...data, keywords: mergeKeywords(data.keywords, elements) });
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
