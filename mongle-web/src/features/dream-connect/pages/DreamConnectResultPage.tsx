import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import errorIcon from '@/assets/icons/dream-connect/error.svg';
import {
  BackHeader,
  PrimaryButton,
  SecondaryButton,
  TokenCost,
  TokenShortageModal,
} from '@/components/common';
import DreamImage from '@/components/common/DreamImage';
import ConnectedDreamList from '@/features/dream-connect/components/ConnectedDreamList';
import ConnectFailModal from '@/features/dream-connect/components/ConnectFailModal';
import ConnectingModal from '@/features/dream-connect/components/ConnectingModal';
import ConnectStateView from '@/features/dream-connect/components/ConnectStateView';
import ConnectStoryCard from '@/features/dream-connect/components/ConnectStoryCard';
import ConnectTagCard from '@/features/dream-connect/components/ConnectTagCard';
import { useConnectDreams } from '@/features/dream-connect/hooks/useConnectDreams';
import { checkTokens, getRequiredTokens } from '@/features/dream-connect/hooks/useCreateWorldImage';
import type { TokenCheck } from '@/features/dream-connect/hooks/useCreateWorldImage';
import { useWorldResult } from '@/features/dream-connect/hooks/useWorldResult';
import {
  useWorldComposition,
  useWorldImage,
  useWorldImageUrl,
} from '@/features/dream-connect/hooks/useWorldStatus';
import { useWorldSummary } from '@/features/dream-connect/hooks/useWorldSummary';
import {
  hasWorldImage,
  IMAGE_TOKEN_COST,
  isWorldImageOutdated,
  MIN_CONNECT_DREAMS,
} from '@/features/dream-connect/types/dreamConnect';
import type { ConnectAddState } from '@/features/dream-connect/types/dreamConnect';

// 꿈 연결하기 - 연결 결과 (/connect/:worldId)
// 피그마: iPhone 16 - 122 · 144 · 145 (기본) · 148 ("그림으로 남기기" 비활성화)
//   146 · 147 (이미지가 있을 때: 맨 위 이미지, 아래 버튼 없음)
//   149 · 150 (원본 꿈 삭제로 이야기가 끊김: "변경된 내용 반영하기") · 152 (반영하기 비활성화)
//   151 (다시 연결해서 이미지가 지금 이야기와 다름: "이미지 다시 생성하기")
//   불러오는 중 · 불러오기 실패는 꿈 선택 화면과 같은 화면 (iPhone 16 - 127 · 129)
function DreamConnectResultPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { worldId: worldIdParam } = useParams();
  const worldId = Number(worldIdParam);

  const { data: result, isError } = useWorldResult(worldId);
  const { data: summary } = useWorldSummary(worldId);
  const { data: composition } = useWorldComposition(worldId);
  const { data: image } = useWorldImage(worldId);
  const { data: imageUrl, refetch: refetchImageUrl } = useWorldImageUrl(worldId, image);

  // 세계관 요약(AI 제목 · 공통 키워드 · 반복되는 감정)은 결과보다 늦게 완성될 수 있음
  // 완성 전 · 실패 · 불러오기 실패면 제목은 폴더 이름, 키워드 · 감정 카드는 숨김 (이전에 완성된 요약이 있으면 그 값 표시)
  // 요약 생성 실패 시 따로 보여줄 화면은 없음 (디자이너 확인)
  const hasSummary = summary?.status === 'COMPLETED' || summary?.hasPreviousResult === true;
  const title = (hasSummary && summary.generatedTitle) || result?.name;
  const commonKeywords = hasSummary ? summary.commonKeywords : [];
  const recurringEmotions = hasSummary ? summary.recurringEmotions : [];

  // 원본 꿈 삭제 · 다시 연결 후 상태
  const hasImage = hasWorldImage(image);
  const hasConnectionGaps = composition?.hasConnectionGaps === true;
  const isImageOutdated = hasImage && isWorldImageOutdated(image);

  // 다시 연결("변경된 내용 반영하기"): 남은 꿈으로 연결 생성을 다시 요청 (크레딧 사용 없음)
  // 완료되면 결과 · 연결 상태 · 이미지 상태를 다시 불러옴
  const {
    status: reconnectStatus,
    connect,
    cancel,
    resetError,
  } = useConnectDreams(() => {
    queryClient.invalidateQueries({ queryKey: ['dreams', 'connect', 'world', worldId] });
  });

  // 다시 연결하려면 연결된 꿈이 2개 이상 남아 있어야 함 (152: 반영하기 비활성화)
  const canReconnect = (result?.dreams.length ?? 0) >= MIN_CONNECT_DREAMS;

  const handleReconnect = () => {
    if (!result || !canReconnect) return;

    connect(result.dreams, {
      worldId,
      connectedDreamIds: result.dreams.map((dream) => dream.dreamId),
    });
  };

  const handleAdd = () => {
    if (!result) return;

    const state: ConnectAddState = {
      worldId,
      connectedDreamIds: result.dreams.map((dream) => dream.dreamId),
    };
    navigate('/connect', { state });
  };

  // 완성본에 남은 꿈이 2개 미만이면 서버가 이미지 생성을 막음 → 버튼 비활성화 (148)
  // 선택한 꿈 수가 아니라 완성본에 실제로 남은 꿈 수로 판단 (백엔드 정책)
  const canCreateImage = (result?.composedDreamCount ?? 0) >= MIN_CONNECT_DREAMS;

  // "그림으로 남기기" · "이미지 다시 생성하기" → 토큰을 먼저 확인하고 화풍 선택 화면으로
  // (디자이너: 비용은 이 화면 버튼에 표시, 화풍 선택 화면에서는 표시하지 않음)
  const [isCheckingTokens, setIsCheckingTokens] = useState(false);
  // 토큰이 부족할 때 "토큰이 부족해요!" 모달에 보여줄 값 (null이면 모달 닫힘)
  const [shortage, setShortage] = useState<TokenCheck | null>(null);

  const handleCreateImage = async () => {
    if (!canCreateImage || isCheckingTokens) return;
    setIsCheckingTokens(true);

    try {
      const tokens = await checkTokens(worldId);

      if (tokens.isEnough) {
        navigate(`/connect/${worldId}/style`);
      } else {
        setShortage(tokens);
      }
    } catch {
      // 잔액을 확인하지 못해도 화풍 선택으로 넘어감 (생성할 때 한 번 더 확인)
      navigate(`/connect/${worldId}/style`);
    } finally {
      setIsCheckingTokens(false);
    }
  };

  const handleSkipImage = () => {
    navigate(`/connect/${worldId}/saved`, { replace: true });
  };

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

  // 아래 버튼 영역 (위에서부터 우선)
  const bottom = (() => {
    if (hasConnectionGaps) return 'reconnect'; // 149 · 150 · 152
    if (isImageOutdated) return 'regenerate'; // 151
    if (hasImage) return 'none'; // 146 · 147
    return 'create'; // 144 · 145 · 148
  })();

  return (
    <div className="min-h-dvh bg-b-900">
      <BackHeader title="꿈 연결하기" />

      {/* 피그마: 위 20 · 좌우 20, 이미지와 제목 카드 사이 16, 제목 카드와 아래 사이 8, 카드 사이 16
          아래 168 = 끝까지 스크롤했을 때 + 버튼과 아래 버튼 사이 18 (피그마 iPhone 16 - 121)
          아래 버튼이 없으면 64 (피그마 iPhone 16 - 147: + 아래 끝에서 화면 끝까지) */}
      <main
        className={[
          'flex flex-col gap-2 px-5 pt-5',
          bottom === 'none' ? 'pb-16' : 'pb-[168px]',
        ].join(' ')}
      >
        {/* 피그마: 353×200, 모서리 16 (iPhone 16 - 146) */}
        {hasImage && imageUrl && (
          <DreamImage
            src={imageUrl}
            alt={title ?? ''}
            className="mb-2 h-[200px] w-full rounded-2xl"
            // 임시 주소가 만료됐을 수 있어서 "다시 시도"를 누르면 새 주소를 받음
            onRetry={() => refetchImageUrl()}
          />
        )}

        <section className="rounded-3xl bg-n-900 p-5">
          <h2 className="text-[18px] leading-[1.4] font-semibold text-b-200">{title}</h2>
        </section>

        <div className="flex flex-col gap-4">
          <ConnectStoryCard paragraphs={result.story} />
          <ConnectTagCard title="공통 키워드" tags={commonKeywords} />
          <ConnectTagCard title="반복되는 감정" tags={recurringEmotions} />
          <ConnectedDreamList dreams={result.dreams} onAdd={handleAdd} />
        </div>
      </main>

      {bottom !== 'none' && (
        // 피그마: 화면 아래 고정, 투명 → B-900(80%) 그라데이션, 버튼과 아래 줄 사이 12, 아래 42 (8 + 홈 인디케이터 34)
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10">
          <div className="pointer-events-auto mx-auto flex w-full max-w-[480px] flex-col items-center gap-3 bg-linear-to-b from-[rgba(30,29,39,0)] to-b-900 to-80% px-5 pb-[42px]">
            {bottom === 'create' && (
              <>
                {/* 비활성화(148): N-200 배경, 동전 · 숫자는 그대로 */}
                <PrimaryButton disabled={!canCreateImage} onClick={() => void handleCreateImage()}>
                  그림으로 남기기
                  <TokenCost amount={IMAGE_TOKEN_COST} />
                </PrimaryButton>
                <SecondaryButton onClick={handleSkipImage}>다음에 만들어볼게요</SecondaryButton>
              </>
            )}

            {bottom === 'reconnect' && (
              <PrimaryButton disabled={!canReconnect} onClick={handleReconnect}>
                변경된 내용 반영하기
              </PrimaryButton>
            )}

            {bottom === 'regenerate' && (
              <PrimaryButton disabled={!canCreateImage} onClick={() => void handleCreateImage()}>
                이미지 다시 생성하기
                {/* 서버가 알려준 재생성 비용 (세계관마다 첫 재생성 무료 0, 이후 1, 디자이너 확인) */}
                <TokenCost amount={getRequiredTokens(image)} />
              </PrimaryButton>
            )}

            {(bottom === 'reconnect' || bottom === 'regenerate') && (
              // 피그마: 아이콘 28 + 사이 6, 14 Medium, error(#FF6F6F)
              <p className="flex h-7 items-center gap-1.5 text-[14px] leading-normal font-medium whitespace-nowrap text-[#ff6f6f]">
                <img src={errorIcon} alt="" className="size-7" />
                연결된 꿈이 수정되었어요
              </p>
            )}
          </div>
        </div>
      )}

      {reconnectStatus === 'connecting' && <ConnectingModal onClose={cancel} />}
      {reconnectStatus === 'error' && <ConnectFailModal type="connect" onClose={resetError} />}

      {/* "충전하고 바로 생성하기" → 화풍 선택 화면의 충전 단계로 (충전이 끝나면 화풍을 고르고 생성) */}
      {shortage && (
        <TokenShortageModal
          required={shortage.required}
          owned={shortage.owned}
          onCharge={() => navigate(`/connect/${worldId}/style?view=charge`)}
          onLater={() => setShortage(null)}
          onClose={() => setShortage(null)}
        />
      )}
    </div>
  );
}

export default DreamConnectResultPage;
