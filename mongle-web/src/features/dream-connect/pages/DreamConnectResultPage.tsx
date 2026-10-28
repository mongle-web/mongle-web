import { useNavigate, useParams } from 'react-router-dom';

import { BackHeader, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';
import ConnectedDreamList from '@/features/dream-connect/components/ConnectedDreamList';
import ConnectStoryCard from '@/features/dream-connect/components/ConnectStoryCard';
import ConnectTagCard from '@/features/dream-connect/components/ConnectTagCard';
import { useWorldResult } from '@/features/dream-connect/hooks/useWorldResult';
import type { ConnectAddState } from '@/features/dream-connect/types/dreamConnect';

// 꿈 연결하기 - 연결 결과 (/connect/:worldId)
// 피그마: iPhone 16 - 122 (위) · 121 (끝까지 스크롤)
function DreamConnectResultPage() {
  const navigate = useNavigate();
  const { worldId: worldIdParam } = useParams();
  const worldId = Number(worldIdParam);

  // TODO: 불러오는 중 / 불러오기 실패 화면은 피그마 디자인 요청 중
  const { data: result } = useWorldResult(worldId);

  const handleAdd = () => {
    if (!result) return;

    const state: ConnectAddState = {
      worldId,
      connectedDreamIds: result.dreams.map((dream) => dream.dreamId),
    };
    navigate('/connect', { state });
  };

  const handleCreateImage = () => {
    // TODO: 3단계 - 그림으로 남기기 (POST /api/v1/worlds/{worldId}/image)
  };

  const handleSkipImage = () => {
    // TODO: 3단계 - 다음에 만들어볼게요 → 저장 완료 화면
  };

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {result && (
        // 피그마: 위 20 · 좌우 20, 제목 카드와 아래 사이 8, 카드 사이 16
        // 아래 148 = 끝까지 스크롤했을 때 마지막 + 버튼이 아래 고정 버튼 바로 위에 오도록 (피그마 화면 높이 1294 기준)
        <main className="flex flex-col gap-2 px-5 pt-5 pb-[148px]">
          <section className="rounded-3xl bg-n-900 p-5">
            <h2 className="text-[18px] leading-[1.4] font-semibold text-b-200">{result.name}</h2>
          </section>

          <div className="flex flex-col gap-4">
            <ConnectStoryCard paragraphs={result.story} />
            <ConnectTagCard title="공통 키워드" tags={result.commonKeywords} />
            <ConnectTagCard title="반복되는 감정" tags={result.repeatedEmotions} />
            <ConnectedDreamList dreams={result.dreams} onAdd={handleAdd} />
          </div>
        </main>
      )}

      {/* 피그마: 화면 아래 고정, 투명 → B-900(80%) 그라데이션, 버튼 사이 12, 아래 42 (8 + 홈 인디케이터 34) */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[480px] flex-col gap-3 bg-linear-to-b from-[rgba(30,29,39,0)] to-b-900 to-80% px-5 pb-[42px]">
          <PrimaryButton onClick={handleCreateImage}>
            그림으로 남기기
            <TokenCost />
          </PrimaryButton>
          <SecondaryButton onClick={handleSkipImage}>다음에 만들어볼게요</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

export default DreamConnectResultPage;
