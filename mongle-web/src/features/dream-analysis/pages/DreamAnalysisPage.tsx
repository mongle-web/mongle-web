import { useQuery } from '@tanstack/react-query';

import { BackHeader } from '@/components/common';
import {
  createInterpretation,
  getInterpretation,
  getMonthlyAnalysis,
} from '@/features/dream-analysis/api/dreamAnalysisApi';
import type { Interpretation } from '@/features/dream-analysis/api/dreamAnalysisApi';
import EmotionSection from '@/features/dream-analysis/components/EmotionSection';
import InterpretationSection from '@/features/dream-analysis/components/InterpretationSection';
import IntroSection from '@/features/dream-analysis/components/IntroSection';
import KeywordSection from '@/features/dream-analysis/components/KeywordSection';

// 해석 생성 중일 때 상태 확인 간격 · 최대 횟수 (3초 x 20회 = 약 1분)
const INTERPRETATION_POLL_INTERVAL = 3000;
const INTERPRETATION_POLL_MAX = 20;

const isGenerating = (interpretation?: Interpretation) =>
  interpretation?.status === 'PROCESSING' || interpretation?.status === 'NOT_GENERATED';

function DreamAnalysisPage() {
  // 이번 달 키워드 · 감정 통계 (month 생략 시 서버가 이번 달로 응답)
  const monthly = useQuery({
    queryKey: ['analysis-records', 'monthly'],
    queryFn: () => getMonthlyAnalysis(),
  });

  // 종합 해석: 들어오면 생성 요청 (이미 있으면 기존 해석을 그대로 돌려줌)
  const created = useQuery({
    queryKey: ['analysis-records', 'interpretation', 'create'],
    queryFn: createInterpretation,
    retry: false,
  });

  // 생성 중이면 완료될 때까지 주기적으로 상태 확인
  const polled = useQuery({
    queryKey: ['analysis-records', 'interpretation'],
    queryFn: getInterpretation,
    enabled: isGenerating(created.data),
    refetchInterval: (query) =>
      (!query.state.data || isGenerating(query.state.data)) &&
      query.state.dataUpdateCount < INTERPRETATION_POLL_MAX
        ? INTERPRETATION_POLL_INTERVAL
        : false,
  });

  const interpretation = polled.data ?? created.data;

  // 해석 영역에 보여줄 글 (실패하면 해석 영역을 보여주지 않음)
  const interpretationText = (() => {
    if (created.isPending || isGenerating(interpretation)) return '몽글이 꿈을 해석하고 있어요';
    if (interpretation?.status === 'EMPTY') return '아직 해석할 꿈이 없어요';
    if (interpretation?.status === 'COMPLETED') return interpretation.interpretation ?? '';
    return null;
  })();

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 분석 기록" />

      <div className="flex flex-col items-start gap-4 px-5 pt-5 pb-16">
        <IntroSection />

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

        {interpretationText !== null && (
          <InterpretationSection interpretation={interpretationText} />
        )}
      </div>
    </div>
  );
}

export default DreamAnalysisPage;
