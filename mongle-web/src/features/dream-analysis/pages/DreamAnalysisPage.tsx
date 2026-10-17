import { BackHeader } from '@/components/common';
import IntroSection from '@/features/dream-analysis/components/IntroSection';

function DreamAnalysisPage() {
  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 분석 기록" />

      <div className="flex flex-col items-start gap-4 px-5 pt-5 pb-16">
        <IntroSection />

        {/* TODO: 자주 나타난 키워드 */}

        {/* TODO: 자주 나타난 감정 */}

        {/* TODO: 몽글의 꿈 해석 */}
      </div>
    </div>
  );
}

export default DreamAnalysisPage;
