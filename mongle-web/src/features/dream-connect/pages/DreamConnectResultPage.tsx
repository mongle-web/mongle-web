import { useCallback, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BackHeader, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';
import ConnectedDreamList from '@/features/dream-connect/components/ConnectedDreamList';
import ConnectFailModal from '@/features/dream-connect/components/ConnectFailModal';
import ConnectStateView from '@/features/dream-connect/components/ConnectStateView';
import ConnectStoryCard from '@/features/dream-connect/components/ConnectStoryCard';
import ConnectTagCard from '@/features/dream-connect/components/ConnectTagCard';
import ImageGeneratingModal from '@/features/dream-connect/components/ImageGeneratingModal';
import { useCreateWorldImage } from '@/features/dream-connect/hooks/useCreateWorldImage';
import { useWorldResult } from '@/features/dream-connect/hooks/useWorldResult';
import type { ConnectAddState } from '@/features/dream-connect/types/dreamConnect';

// 꿈 연결하기 - 연결 결과 (/connect/:worldId)
// 피그마: iPhone 16 - 122 (위) · 121 (끝까지 스크롤) · 132 (이미지 생성 실패 · 다시 생성하기)
//   불러오는 중 · 불러오기 실패는 꿈 선택 화면과 같은 화면 (iPhone 16 - 127 · 129)
function DreamConnectResultPage() {
  const navigate = useNavigate();
  const { worldId: worldIdParam } = useParams();
  const worldId = Number(worldIdParam);

  const { data: result, isError } = useWorldResult(worldId);

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

  const { status, generate, resetStatus, isGenerating } = useCreateWorldImage(
    worldId,
    handleImageCompleted,
  );

  // 생성 중 모달을 닫아도 이미지는 계속 만들어짐 (완성되면 자동으로 이동)
  const [isModalClosed, setIsModalClosed] = useState(false);

  const handleCreateImage = () => {
    setIsModalClosed(false);
    generate();
  };

  // 실패 모달 "다시 생성하기" → 실패 모달을 닫고 처음부터 다시 생성 (생성 중 모달 다시 표시)
  // TODO: 화풍 선택 화면이 생기면 고른 화풍 그대로 다시 생성
  const handleRetryImage = () => {
    resetStatus();
    handleCreateImage();
  };

  const handleSkipImage = () => {
    // 이미지를 만드는 중에는 이동하지 않음
    if (isGenerating) return;
    navigate(`/connect/${worldId}/saved`, { replace: true });
  };

  // TODO: 토큰 부족(status === 'noTokens') 처리
  //   꿈 기록 화면의 "토큰이 부족해요!" 모달 · 충전 화면을 공통으로 옮겨서 사용 (꿈 기록 담당과 협의)

  // 불러오는 중 · 불러오기 실패면 결과 · 버튼 대신 안내 화면 (실패는 화면을 나갔다 들어오면 다시 불러옴)
  // 주소의 worldId가 숫자가 아니면 불러오지 않으므로 실패로 처리
  if (!result) {
    const isInvalidId = !Number.isInteger(worldId) || worldId <= 0;

    return (
      // 빛 번짐이 화면 밖으로 나가도 가로 스크롤이 생기지 않게 overflow-x-clip
      <div className="relative min-h-dvh overflow-x-clip bg-b-900">
        <BackHeader title="꿈 연결하기" />
        <ConnectStateView state={isError || isInvalidId ? 'error' : 'loading'} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {/* 피그마: 위 20 · 좌우 20, 제목 카드와 아래 사이 8, 카드 사이 16
          아래 168 = 끝까지 스크롤했을 때 + 버튼과 "그림으로 남기기" 사이 18 (피그마 iPhone 16 - 121: + 아래 끝이 화면 아래에서 168) */}
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

      {/* 생성 중 모달을 닫은 뒤에 실패해도 실패 모달은 보여줌 */}
      {status === 'error' && (
        <ConnectFailModal type="image" onClose={resetStatus} onRetry={handleRetryImage} />
      )}
    </div>
  );
}

export default DreamConnectResultPage;
