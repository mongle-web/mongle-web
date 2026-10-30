import { useQuery } from '@tanstack/react-query';

import { BackHeader } from '@/components/common';
import { getMonthlyAnalysis } from '@/features/dream-analysis/api/dreamAnalysisApi';
import EmotionSection from '@/features/dream-analysis/components/EmotionSection';
import InterpretationSection from '@/features/dream-analysis/components/InterpretationSection';
import IntroSection from '@/features/dream-analysis/components/IntroSection';
import KeywordSection from '@/features/dream-analysis/components/KeywordSection';
import { mockInterpretation } from '@/features/dream-analysis/mocks/dreamAnalysisMock';

function DreamAnalysisPage() {
  // 이번 달 키워드 · 감정 통계 (month 생략 시 서버가 이번 달로 응답)
  const monthly = useQuery({
    queryKey: ['analysis-records', 'monthly'],
    queryFn: () => getMonthlyAnalysis(),
  });

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 분석 기록" />

      <div className="flex flex-col items-start gap-4 px-5 pt-5 pb-16">
        <IntroSection />

        {/* TODO: 불러오는 중 · 실패 화면 디자인 확인 (현재 빈 상태 문구와 같은 스타일) */}
        {monthly.isPending && (
          <p className="w-full py-10 text-center text-[14px] leading-[1.5] font-semibold text-b-400">
            분석 기록을 불러오고 있어요
          </p>
        )}

        {monthly.isError && (
          <div className="flex w-full flex-col items-center gap-3 py-10">
            <p className="text-center text-[14px] leading-[1.5] font-semibold text-b-400">
              분석 기록을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => monthly.refetch()}
              className="cursor-pointer rounded-full bg-n-900 px-4 py-2"
            >
              {/* 전역 button { font: inherit } 이 글자 클래스를 덮어써서 span에 지정 */}
              <span className="text-[14px] leading-[1.5] font-medium text-b-200">다시 시도</span>
            </button>
          </div>
        )}

        {monthly.isSuccess && (
          <>
            <KeywordSection keywords={monthly.data.keywords} />

            <EmotionSection emotions={monthly.data.emotions} />
          </>
        )}

        {/* TODO: 종합 해석 API 연동 (3단계) */}
        <InterpretationSection interpretation={mockInterpretation} />
      </div>
    </div>
  );
}

export default DreamAnalysisPage;
