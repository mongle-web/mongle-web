import { useCallback, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BackHeader, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';
import ConnectedDreamList from '@/features/dream-connect/components/ConnectedDreamList';
import ConnectStoryCard from '@/features/dream-connect/components/ConnectStoryCard';
import ConnectTagCard from '@/features/dream-connect/components/ConnectTagCard';
import ImageGeneratingModal from '@/features/dream-connect/components/ImageGeneratingModal';
import { useCreateWorldImage } from '@/features/dream-connect/hooks/useCreateWorldImage';
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

  // 이미지가 완성되면 꿈 기록과 같은 "꿈 이미지가 완성되었어요" 화면으로 이동
  const handleImageCompleted = useCallback(
    (imageUrl: string) => {
      navigate('/dreams/image-result', { replace: true, state: { imageUrl, saved: true } });
    },
    [navigate],
  );

  const { generate, isGenerating } = useCreateWorldImage(worldId, handleImageCompleted);

  // 생성 중 모달을 닫아도 이미지는 계속 만들어짐 (완성되면 자동으로 이동)
  const [isModalClosed, setIsModalClosed] = useState(false);

  const handleCreateImage = () => {
    setIsModalClosed(false);
    generate();
  };

  const handleSkipImage = () => {
    // 이미지를 만드는 중에는 이동하지 않음
    if (isGenerating) return;
    navigate(`/connect/${worldId}/saved`, { replace: true });
  };

  // TODO: 토큰 부족(status === 'noTokens') · 생성 실패(status === 'error') 처리
  //   꿈 기록 화면의 "토큰이 부족해요!" 모달 · 충전 화면을 공통으로 옮겨서 사용 (꿈 기록 담당과 협의)

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {result && (
        // 피그마: 위 20 · 좌우 20, 제목 카드와 아래 사이 8, 카드 사이 16
        // 아래 168 = 끝까지 스크롤했을 때 + 버튼과 "그림으로 남기기" 사이 18 (피그마 iPhone 16 - 121: + 아래 끝이 화면 아래에서 168)
        <main className="flex flex-col gap-2 px-5 pt-5 pb-[168px]">
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
          {/* 피그마: 생성 중에도 버튼은 보라색 그대로 (모달이 위를 덮고, 중복 요청은 막음) */}
          <PrimaryButton onClick={handleCreateImage}>
            그림으로 남기기
            <TokenCost />
          </PrimaryButton>
          <SecondaryButton onClick={handleSkipImage}>다음에 만들어볼게요</SecondaryButton>
        </div>
      </div>

      {isGenerating && !isModalClosed && (
        <ImageGeneratingModal onClose={() => setIsModalClosed(true)} />
      )}
    </div>
  );
}

export default DreamConnectResultPage;
