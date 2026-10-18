import { BackHeader } from '@/components/common';
import EmotionSection from '@/features/dream-analysis/components/EmotionSection';
import InterpretationSection from '@/features/dream-analysis/components/InterpretationSection';
import IntroSection from '@/features/dream-analysis/components/IntroSection';
import KeywordSection from '@/features/dream-analysis/components/KeywordSection';
import {
  mockEmotions,
  mockInterpretation,
  mockKeywords,
} from '@/features/dream-analysis/mocks/dreamAnalysisMock';

function DreamAnalysisPage() {
  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 분석 기록" />

      <div className="flex flex-col items-start gap-4 px-5 pt-5 pb-16">
        <IntroSection />

        <KeywordSection keywords={mockKeywords} />

        <EmotionSection emotions={mockEmotions} />

        {/* TODO: API 연동 시 mock 대신 실제 데이터 */}
        <InterpretationSection interpretation={mockInterpretation} />
      </div>
    </div>
  );
}

export default DreamAnalysisPage;
