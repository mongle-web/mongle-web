import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import {
  CreditCharge,
  FlowModal,
  Glow,
  PrimaryButton,
  SecondaryButton,
  TokenCost,
  TokenShortageModal,
} from '@/components/common';

import DreamImage from '@/components/common/DreamImage';
import DreamDatePicker from '../components/DreamDatePicker';
import EmotionSelector from '../components/EmotionSelector';
import ImageStyleSelector from '../components/ImageStyleSelector';

import { MAX_LENGTH, parseRecordDate, toDateString } from '../utils/dreamDraft';
import {
  clearImageIntent,
  readImageIntent,
  writeImageIntent,
  type DreamImageView,
} from '../utils/imageIntent';
import { resolveImageStyles } from '../utils/imageStyles';

import { useDreamRecord } from '../hooks/useDreamRecord';
import { INITIAL_DREAM_IMAGE_COST } from '../api/dreamRecordApi';

import imageFailureImage from '@/assets/images/dream-connect/connect_image_error.png';

const ASSET = '/dream-record/';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DreamRecordFlow() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const flow = useDreamRecord();
  const reduceMotion = useReducedMotion();

  const [viewOverride, setViewOverride] = useState<DreamImageView | null>(null);
  const [chosenStyleOverride, setChosenStyleOverride] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loadingClosed, setLoadingClosed] = useState(false);
  const [dismissedFailureKey, setDismissedFailureKey] = useState('');

  const { draft, busy, ready, tokens, cost } = flow;

  const date = parseRecordDate(draft.date) ?? new Date();
  const styles = flow.options.data?.styles ?? [];
  const dreamId = flow.dream?.dreamId;
  const intent = dreamId ? readImageIntent(dreamId) : null;
  const restoredStyle = intent?.style && styles.includes(intent.style) ? intent.style : '';
  const chosenStyle = chosenStyleOverride || restoredStyle;
  // 순서: 그림으로 남길지 결정(offer) → 화풍 선택(style) → 생성 (토큰이 부족하면 충전 후 이어서 생성)
  const view = viewOverride ?? (params.get('orderId') ? 'charge' : (intent?.view ?? 'offer'));

  const screen =
    flow.dream?.recordStatus === 'COMPLETED' && view === 'charge'
      ? 'charge'
      : flow.screen === 'image'
        ? view
        : flow.screen;

  const finished = screen === 'result' || screen === 'complete';

  const mappedStyleCount = resolveImageStyles(styles).filter((style) => style.serverValue).length;

  const validChoice =
    !!chosenStyle && chosenStyle === flow.selectedStyle && styles.includes(chosenStyle);

  const canGenerate = flow.canGenerate && (screen === 'result' || validChoice);

  // AI 분석 · 이야기를 아직 만드는 중 (새로 기록한 꿈은 10초쯤 걸림)
  // 이때는 "그림으로 남기기" 대신 "꿈을 그릴 준비 중이에요"를 보여줌
  // 실패 · 내용 변경은 아래 "다시 시도" 안내가 따로 있어서 제외
  const generationStatus = flow.generation.data?.status;
  const isPreparingStory =
    !flow.generation.isError &&
    !flow.analysis.isError &&
    !flow.story.isError &&
    generationStatus !== 'FAILED' &&
    !flow.generation.data?.sourceChanged &&
    (generationStatus !== 'COMPLETED' ||
      flow.analysis.data?.status !== 'COMPLETED' ||
      flow.story.data?.status !== 'COMPLETED');

  // 이미지를 만들 수 있는 이야기가 준비됨 → "그림으로 남기기"로 화풍 선택에 넘어갈 수 있음
  const isStoryReady =
    generationStatus === 'COMPLETED' &&
    !flow.generation.data?.sourceChanged &&
    flow.analysis.data?.status === 'COMPLETED' &&
    !flow.analysis.data.sourceChanged &&
    flow.story.data?.status === 'COMPLETED' &&
    !flow.story.data.sourceChanged;
  const canChooseStyle = ready && isStoryReady && !busy && !flow.imageBusy;

  useEffect(() => {
    if (flow.dream && (screen === 'result' || screen === 'complete')) {
      clearImageIntent(flow.dream.dreamId);
    }
  }, [flow.dream, screen]);

  const failureKey =
    flow.image.data?.status === 'FAILED'
      ? `${flow.image.data.imageId}:${flow.image.data.imageVersion}:${flow.image.data.failureCode ?? ''}`
      : '';
  const showImageFailure = !!failureKey && dismissedFailureKey !== failureKey;

  function rememberImageStep(nextView: DreamImageView, nextStyle = chosenStyle) {
    const dreamId = flow.dream?.dreamId;

    setViewOverride(nextView);

    if (dreamId) {
      const existing = readImageIntent(dreamId);
      writeImageIntent({
        dreamId,
        style: nextStyle,
        view: nextView,
        ...(existing?.action ? { action: existing.action } : {}),
        ...(existing?.imageVersion !== undefined ? { imageVersion: existing.imageVersion } : {}),
      });
    }
  }

  function goBack() {
    if (busy) {
      return;
    }

    if (screen === 'charge') {
      rememberImageStep(validChoice ? 'style' : 'offer');
      return;
    }

    if (screen === 'style') {
      rememberImageStep('offer');
      return;
    }

    flow.handleBack();
  }

  function generate() {
    if (!canGenerate) {
      return;
    }

    setLoadingClosed(false);
    setDismissedFailureKey(failureKey);
    flow.handleGenerate();
  }

  function continueAfterPayment() {
    setParams(
      (current) => {
        current.delete('orderId');
        return current;
      },
      { replace: true },
    );

    rememberImageStep('style');
    setLoadingClosed(false);
    setDismissedFailureKey(failureKey);
    flow.handleGenerate();
  }

  function openCharge() {
    flow.setModal(null);
    rememberImageStep('charge');
  }

  return (
    <div className="mongle-dream-record flex min-h-dvh flex-col overflow-x-clip bg-b-900 pt-[env(safe-area-inset-top)] text-b-200">
      {!finished && (
        <header className="grid h-11 shrink-0 grid-cols-[28px_minmax(0,1fr)_28px] items-center px-5">
          <button
            type="button"
            disabled={busy}
            onClick={goBack}
            aria-label="이전 화면"
            className="flex size-7 items-center justify-center bg-transparent"
          >
            <img src={`${ASSET}back.svg`} alt="" className="rotate-180" />
          </button>

          {screen === 'charge' ? (
            <span className="text-center font-medium">토큰 충전</span>
          ) : (
            <button
              type="button"
              disabled={flow.dateLocked || !ready}
              onClick={() => setDatePickerOpen(true)}
              aria-label="꿈 기록 날짜 선택"
              className="inline-flex h-11 items-center justify-center gap-1 text-[16px] font-medium"
            >
              {date.getMonth() + 1}월 {date.getDate()}일 {WEEKDAYS[date.getDay()]}요일
              {!flow.dateLocked && <img src={`${ASSET}chevron.svg`} alt="" className="rotate-90" />}
            </button>
          )}

          <span aria-hidden="true" />
        </header>
      )}

      <motion.main
        key={screen}
        initial={reduceMotion ? false : { opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
        className={`flex-1 px-5 ${finished ? 'pt-[154px] text-center' : 'pt-5'}`}
      >
        {screen === 'text' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">오늘 밤, 무엇을 보았나요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
              꿈에서 기억나는 순간들을
              <br />
              떠오르는 대로 편하게 작성해보세요.
            </p>

            <div className="mt-6 flex h-[262px] flex-col rounded-3xl bg-n-900 p-5">
              <label htmlFor="dream-content" className="sr-only">
                꿈 내용
              </label>

              <textarea
                id="dream-content"
                value={draft.content}
                disabled={!ready || busy}
                maxLength={MAX_LENGTH}
                placeholder="꿈의 내용을 자유롭게 작성해 주세요."
                onChange={(event) => {
                  flow.updateDraft({
                    content: event.target.value,
                  });

                  flow.setMessage('');
                }}
                className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-[14px]! leading-[1.5]! outline-none placeholder:text-b-600"
              />

              <p className="mt-3 text-right text-xs text-b-600">
                {draft.content.length} / {MAX_LENGTH}
              </p>
            </div>
          </>
        )}

        {screen === 'emotion' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">꿈속에서의 감정은 어땠나요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
              꿈에서 느꼈던 순간의 감정을 떠올려보고
              <br />
              가장 가까운 감정을 1~2개 선택해 주세요.
            </p>

            <EmotionSelector
              selected={draft.emotions}
              onToggle={flow.toggleEmotion}
              disabled={busy || !ready}
            />
          </>
        )}

        {screen === 'style' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">
              어떤 스타일의 그림을 만들어볼까요?
            </h1>

            <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
              꿈의 분위기에 어울리는 화풍을 선택해
              <br />
              나만의 특별한 작품으로 완성해 보세요.
            </p>

            <ImageStyleSelector
              serverStyles={styles}
              selected={chosenStyle}
              disabled={busy || flow.imageBusy || !flow.options.isSuccess}
              onSelect={(style) => {
                setChosenStyleOverride(style);
                flow.setStyle(style);

                if (flow.dream) {
                  writeImageIntent({ dreamId: flow.dream.dreamId, style, view: 'style' });
                }
              }}
            />

            {flow.options.isSuccess && mappedStyleCount < 4 && (
              <p role="status" className="sr-only">
                서버에서 지원하는 화풍만 선택할 수 있습니다.
              </p>
            )}
          </>
        )}

        {screen === 'offer' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">이 꿈, 그림으로 남겨볼까요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
              꿈에서 기억나는 장면과 분위기를 담아
              <br />
              나만의 꿈 이미지로 만들어보세요.
            </p>

            <div
              aria-label={`보유 토큰 ${tokens ?? '확인 중'}개`}
              className="mt-4 flex w-fit items-center gap-1.5 rounded-full px-2 py-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
            >
              <img src={`${ASSET}coin.svg`} alt="" />
              <span className="text-[16px] leading-[1.3] font-semibold">{tokens ?? '—'}</span>
            </div>

            <div className="relative mt-[50px] h-[274px]">
              <Glow className="top-[-49px]" />

              <img
                src={`${ASSET}painter.png`}
                alt="꿈을 그리는 몽글"
                className="relative mx-auto h-[200px] w-[223px] object-cover"
              />
            </div>

            {flow.generation.data?.status === 'FAILED' && (
              <div className="relative z-10 -mt-10 flex flex-col gap-3 text-center">
                <p className="text-sm text-b-400">
                  꿈을 그림으로 준비하지 못했어요. 기록은 안전하게 저장되어 있어요.
                </p>

                <SecondaryButton disabled={busy} onClick={flow.retryGeneration}>
                  다시 시도
                </SecondaryButton>
              </div>
            )}

            {flow.generation.data?.sourceChanged && (
              <div className="relative z-10 flex flex-col gap-3 text-center">
                <p className="text-sm text-b-400">
                  꿈 내용이 변경되었어요. 보관함에서 최신 기록을 확인해 주세요.
                </p>

                {/* 실패 안내가 함께 떠 있으면 버튼은 위 하나만 (같은 동작) */}
                {flow.generation.data.status !== 'FAILED' && (
                  <SecondaryButton disabled={busy} onClick={flow.retryGeneration}>
                    다시 시도
                  </SecondaryButton>
                )}
              </div>
            )}
          </>
        )}

        {screen === 'charge' && flow.dream && (
          <CreditCharge
            storageKey={`mongle:payment-pending:${flow.dream.dreamId}`}
            cost={cost ?? 0}
            canGenerate={flow.canGenerate && (flow.screen === 'result' || validChoice)}
            onContinue={continueAfterPayment}
          />
        )}

        {finished && (
          <>
            <h1 className="text-[20px] leading-[1.4] font-semibold">
              {screen === 'result' ? '꿈 이미지가 완성되었어요' : '기록한 꿈을 저장했어요'}
            </h1>

            <p className="mt-3 text-[16px] leading-[1.5] text-b-400">
              보관함에 소중히 담아두었어요.
            </p>

            {screen === 'result' ? (
              flow.download.data ? (
                <DreamImage
                  key={flow.download.data.url}
                  src={flow.download.data.url}
                  alt="꿈 이미지"
                  className="mt-[54px] aspect-square w-full rounded-2xl"
                  onRetry={() => flow.download.refetch()}
                />
              ) : (
                <p className="mt-10 text-sm">
                  이미지 주소를 확인하고 있어요. 실패하면 상태 다시 조회를 눌러 주세요.
                </p>
              )
            ) : (
              <div className="relative mt-[67px] h-[270px]">
                <Glow className="top-[-90px]" />

                <img
                  src={`${ASSET}saved.png`}
                  alt="꿈 기록을 반기는 몽글"
                  className="relative mx-auto h-[169px] w-[188px] object-cover"
                />
              </div>
            )}
          </>
        )}
      </motion.main>

      <footer className="sticky bottom-0 z-10 bg-b-900 px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        {flow.storageWarning && (
          <p role="status" className="mb-3 text-center text-sm text-b-400">
            {flow.storageWarning}
          </p>
        )}

        {flow.message && (
          <p role="alert" className="mb-3 text-center text-sm text-b-300">
            {flow.message}
          </p>
        )}

        {!ready && (
          <SecondaryButton disabled={busy} onClick={flow.restore}>
            서버 기록 다시 불러오기
          </SecondaryButton>
        )}

        {!ready && (
          <SecondaryButton onClick={() => navigate('/login')}>로그인하러 가기</SecondaryButton>
        )}

        {screen === 'text' && (
          <PrimaryButton
            disabled={!draft.content.trim() || busy || !ready}
            onClick={flow.handleNext}
          >
            다음
          </PrimaryButton>
        )}

        {screen === 'emotion' && (
          <div className="flex gap-4">
            <SecondaryButton disabled={busy} onClick={flow.handleBack}>
              이전
            </SecondaryButton>

            <PrimaryButton
              disabled={
                !draft.emotions.length ||
                draft.emotions.length > 2 ||
                busy ||
                !ready
              }
              onClick={flow.handleNext}
            >
              다음
            </PrimaryButton>
          </div>
        )}

        {/* 화풍을 고르고 "그림 완성하기" → 바로 생성 (토큰이 부족하면 "토큰이 부족해요!" 모달) */}
        {screen === 'style' && (
          <PrimaryButton disabled={!canGenerate} onClick={generate}>
            그림 완성하기
          </PrimaryButton>
        )}

        {/* "그림으로 남기기" → 화풍 선택으로 (비용은 이 버튼에 표시) */}
        {screen === 'offer' && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={!canChooseStyle} onClick={() => rememberImageStep('style')}>
              {!canChooseStyle && isPreparingStory ? (
                '꿈을 그릴 준비 중이에요'
              ) : (
                <>
                  그림으로 남기기
                  {cost !== null && <TokenCost amount={cost} />}
                </>
              )}
            </PrimaryButton>

            <SecondaryButton
              disabled={busy || flow.imageBusy}
              onClick={flow.handleSaveWithoutImage}
            >
              다음에 만들어볼게요
            </SecondaryButton>
          </div>
        )}

        {finished && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={busy} onClick={() => navigate('/')}>
              홈으로 돌아가기
            </PrimaryButton>

            {screen === 'result' && (
              <SecondaryButton
                disabled={!canGenerate || cost === null || flow.imageBusy || busy}
                onClick={generate}
              >
                이미지 다시 생성하기
                {cost !== null && <TokenCost amount={cost} muted />}
              </SecondaryButton>
            )}
          </div>
        )}
      </footer>

      {datePickerOpen && (
        <DreamDatePicker
          value={date}
          onChange={flow.selectDate}
          onClose={() => setDatePickerOpen(false)}
        />
      )}

      {flow.imageBusy && !loadingClosed && (
        <FlowModal title="이미지 생성 중" onClose={() => setLoadingClosed(true)} animate>
          <button
            type="button"
            aria-label="진행 창 닫기"
            onClick={() => setLoadingClosed(true)}
            className="mb-4 ml-auto block"
          >
            <img src={`${ASSET}close.svg`} alt="" />
          </button>

          <img
            src={`${ASSET}painter.png`}
            alt=""
            className="mx-auto h-[131px] w-[146px] object-cover"
          />

          <h2 role="status" className="mt-4 text-center text-[18px] font-semibold">
            이미지를 생성하고 있어요…
          </h2>
        </FlowModal>
      )}

      {flow.image.data?.status === 'FAILED' && showImageFailure && (
        <FlowModal
          title="이미지 생성 실패"
          onClose={() => setDismissedFailureKey(failureKey)}
          animate
        >
          <button
            type="button"
            aria-label="안내 창 닫기"
            onClick={() => setDismissedFailureKey(failureKey)}
            className="mb-4 ml-auto block"
          >
            <img src={`${ASSET}close.svg`} alt="" />
          </button>

          <img
            src={imageFailureImage}
            alt=""
            className="mx-auto h-[116px] w-[146px] object-contain"
          />

          <h2 className="mt-3 text-center text-[18px] leading-[1.4] font-semibold">
            이미지 생성에 실패했어요
          </h2>

          <p className="mt-3 text-center text-[14px] leading-[1.5] text-b-600">
            {flow.image.data.hasPreviousResult ? (
              <>이전 이미지는 그대로 보관했어요.</>
            ) : (
              <>
                꿈을 그림으로 만들지 못했어요.
                <br />
                잠시 후 다시 시도해 주세요.
              </>
            )}
          </p>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={generate}
            className="mt-5 h-9 w-full rounded-lg border border-white/40 bg-p-500 px-3 py-2 text-[14px] leading-[1.3] font-semibold disabled:bg-n-200"
          >
            다시 생성하기
          </button>
        </FlowModal>
      )}

      {flow.modal === 'tokens' && (
        <TokenShortageModal
          required={flow.tokenRequirement ?? cost ?? INITIAL_DREAM_IMAGE_COST}
          available={tokens}
          onClose={() => {
            flow.setModal(null);
          }}
          onCharge={openCharge}
        />
      )}
    </div>
  );
}

export default function DreamRecordPage() {
  const [params] = useSearchParams();

  return <DreamRecordFlow key={params.get('date') ?? toDateString(new Date())} />;
}
