import { useQuery } from '@tanstack/react-query';

import { getMonthlyAnalysis } from '@/features/dream-analysis/api/dreamAnalysisApi';

// 이번 달 꿈 분석 통계 (키워드 · 감정)
// 꿈 분석 기록 페이지와 홈 꿈 분석 카드가 같은 데이터를 함께 사용 (month 생략 시 서버가 이번 달로 응답)
export const useMonthlyAnalysis = (enabled = true) => {
  return useQuery({
    queryKey: ['analysis-records', 'monthly'],
    queryFn: () => getMonthlyAnalysis(),
    enabled,
  });
};
