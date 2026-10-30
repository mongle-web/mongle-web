import { useCallback, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BackHeader, PrimaryButton } from '@/components/common';
import ConnectFailModal from '@/features/dream-connect/components/ConnectFailModal';
import ImageGeneratingModal from '@/features/dream-connect/components/ImageGeneratingModal';
import { useCreateWorldImage } from '@/features/dream-connect/hooks/useCreateWorldImage';
import { useImageStyles } from '@/features/dream-connect/hooks/useWorldStatus';
import ImageStyleSelector from '@/features/dream-record/components/ImageStyleSelector';

// 꿈 연결하기 - 그림 화풍 선택 (/connect/:worldId/style)
// 피그마: iPhone 16 - 136 (선택 전, 버튼 비활성화) · 137 (선택 후)
//   138 (이미지 생성 중 모달) · 139 (생성 실패 모달 → "다시 생성하기"는 고른 화풍 그대로)
// 화풍 카드는 꿈 기록과 같은 컴포넌트(ImageStyleSelector) 사용
// 비용은 결과 화면 버튼에서 보여주고 토큰도 거기서 먼저 확인 (디자이너: 이 화면에는 비용 표시 없음)
function DreamConnectStylePage() {
  const navigate = useNavigate();
  const { worldId: worldIdParam } = useParams();
  const worldId = Number(worldIdParam);

  const { data: styles = [] } = useImageStyles();
  const [selectedStyle, setSelectedStyle] = useState('');

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

  const handleComplete = () => {
    if (!selectedStyle || isGenerating) return;
    setIsModalClosed(false);
    generate(selectedStyle);
  };

  // 실패 모달 "다시 생성하기" → 고른 화풍 그대로 다시 생성 (디자이너 확인)
  const handleRetry = () => {
    resetStatus();
    handleComplete();
  };

  // TODO: 토큰 부족(status === 'noTokens') 처리 (결과 화면에서 먼저 확인하지만 그 사이 잔액이 줄었을 때)
  //   꿈 기록 화면의 "토큰이 부족해요!" 모달 · 충전 화면을 공통으로 옮겨서 사용 (꿈 기록 담당과 협의)

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {/* 피그마: 문구 영역 위 · 좌우 · 아래 20, 제목과 설명 사이 12
          화풍 카드 컴포넌트에 위 여백 15가 있어서 아래는 5만 둠 (합 20)
          아래 149 = 마지막 카드 아래에서 화면 끝까지 (피그마 iPhone 16 - 137: 카드 끝 703) */}
      <main className="px-5 pb-[149px]">
        <section className="flex flex-col gap-3 pt-5 pb-[5px]">
          <h2 className="text-[18px] leading-[1.4] font-semibold text-b-200">
            어떤 스타일의 그림을 만들어볼까요?
          </h2>
          <p className="text-[14px] leading-[1.5] font-medium text-b-600">
            꿈의 분위기에 어울리는 화풍을 선택해
            <br />
            나만의 특별한 작품으로 완성해 보세요.
          </p>
        </section>

        <ImageStyleSelector
          serverStyles={styles}
          selected={selectedStyle}
          disabled={isGenerating}
          onSelect={setSelectedStyle}
        />
      </main>

      {/* 피그마: 화면 아래 고정, 투명 → B-900(80%) 그라데이션, 아래 42 (8 + 홈 인디케이터 34) */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-[480px] bg-linear-to-b from-[rgba(30,29,39,0)] to-b-900 to-80% px-5 pb-[42px]">
          {/* 화풍을 고르기 전에는 비활성화 (136) */}
          <PrimaryButton disabled={!selectedStyle} onClick={handleComplete}>
            그림 완성하기
          </PrimaryButton>
        </div>
      </div>

      {isGenerating && !isModalClosed && (
        <ImageGeneratingModal onClose={() => setIsModalClosed(true)} />
      )}

      {/* 생성 중 모달을 닫은 뒤에 실패해도 실패 모달은 보여줌 */}
      {status === 'error' && (
        <ConnectFailModal type="image" onClose={resetStatus} onRetry={handleRetry} />
      )}
    </div>
  );
}

export default DreamConnectStylePage;
