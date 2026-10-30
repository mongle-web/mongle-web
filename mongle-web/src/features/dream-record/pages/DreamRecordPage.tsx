import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FlowModal, Glow, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';

import DreamImage from '@/components/common/DreamImage';
import DreamDatePicker from '../components/DreamDatePicker';
import EmotionSelector from '../components/EmotionSelector';
import DreamCharge from '../components/DreamCharge';

import { MAX_LENGTH, parseRecordDate, toDateString } from '../utils/dreamDraft';

import { useDreamRecord } from '../hooks/useDreamRecord';

const ASSET = '/dream-record/';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const STYLE_NAMES: Record<string, string> = {
  SURREALISM: '초현실주의',
  CUBISM: '입체주의',
  EXPRESSIONISM: '표현주의',
  ILLUSTRATION: '일러스트',
};

// 화풍 카드 원본 이미지가 없는 동안 사용하는 배경.
const CARD_COLORS = [
  'linear-gradient(145deg,#405776,#b1a693)',
  'linear-gradient(35deg,#283957,#a15e37,#d0a861)',
  'linear-gradient(140deg,#293f47,#84713f,#739284)',
  'linear-gradient(140deg,#5b7d9e,#bfb4cd,#637b65)',
];

function DreamRecordFlow() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const flow = useDreamRecord();

  const [view, setView] = useState<'style' | 'offer' | 'charge'>(() =>
    params.get('orderId') ? 'charge' : 'style',
  );

  const [chosenStyle, setChosenStyle] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loadingClosed, setLoadingClosed] = useState(false);

  const { draft, busy, ready, tokens, cost } = flow;

  const screen =
    flow.dream?.recordStatus === 'COMPLETED' && view === 'charge'
      ? 'charge'
      : flow.screen === 'image'
        ? view
        : flow.screen;

  const finished = screen === 'result' || screen === 'complete';

  const date = parseRecordDate(draft.date) ?? new Date();
  const styles = flow.options.data?.styles ?? [];

  const validChoice =
    !!chosenStyle && chosenStyle === flow.selectedStyle && styles.includes(chosenStyle);

  const canGenerate = flow.canGenerate && (screen === 'result' || validChoice);

  const generationPending = ['QUEUED', 'PROCESSING'].includes(flow.generation.data?.status ?? '');

  function goBack() {
    if (busy) {
      return;
    }

    if (screen === 'charge') {
      setView(validChoice ? 'offer' : 'style');
      return;
    }

    if (screen === 'offer') {
      setView('style');
      return;
    }

    flow.handleBack();
  }

  function generate() {
    if (!canGenerate) {
      return;
    }

    setLoadingClosed(false);
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

    setView('offer');
    setLoadingClosed(false);
    flow.handleGenerate();
  }

  function openCharge() {
    flow.setModal(null);
    setView('charge');
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-b-900 pt-[env(safe-area-inset-top)] text-b-200">
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

      <main className={`flex-1 px-5 ${finished ? 'pt-[120px] text-center' : 'pt-5'}`}>
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
              가장 가까운 감정을 1~3개 선택해 주세요.
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

            {flow.options.isPending && (
              <p role="status" className="mt-6">
                화풍을 불러오고 있어요.
              </p>
            )}

            {flow.options.isSuccess && !styles.length && (
              <p className="mt-6">
                현재 선택할 수 있는 화풍이 없어요. 나중에 그림을 만들 수 있어요.
              </p>
            )}

            <div role="group" aria-label="화풍 선택" className="mt-6 grid grid-cols-2 gap-4">
              {styles.map((style, index) => (
                <button
                  key={style}
                  type="button"
                  disabled={busy || flow.imageBusy}
                  aria-pressed={chosenStyle === style}
                  onClick={() => {
                    setChosenStyle(style);
                    flow.setStyle(style);
                  }}
                  style={{
                    background: CARD_COLORS[index % CARD_COLORS.length],
                  }}
                  className={[
                    'relative flex aspect-[180/250] items-end justify-center',
                    'overflow-hidden rounded-[24px] p-5 text-sm font-semibold shadow-lg',
                    chosenStyle === style
                      ? 'ring-2 ring-p-300 ring-offset-2 ring-offset-b-900'
                      : '',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-8 left-5 text-5xl font-light text-white/20"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                  <span className="relative">{STYLE_NAMES[style.toUpperCase()] ?? style}</span>

                  {chosenStyle === style && (
                    <span className="absolute top-3 right-3 rounded-full bg-p-500 px-2 py-1 text-xs">
                      선택
                    </span>
                  )}
                </button>
              ))}
            </div>
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

            <div className="mt-4 flex w-fit items-center gap-2 rounded-full bg-n-900 px-3 py-1.5">
              <img src={`${ASSET}coin.svg`} alt="" />
              <span aria-label="보유 토큰">{tokens ?? '—'}</span>
            </div>

            <p className="mt-4 text-sm text-b-400">
              선택한 화풍: {STYLE_NAMES[chosenStyle.toUpperCase()] ?? chosenStyle}
            </p>

            <div className="relative mt-14 h-[274px]">
              <Glow className="top-[-49px]" />

              <img
                src={`${ASSET}painter.png`}
                alt="꿈을 그리는 몽글"
                className="relative mx-auto h-[200px] w-[223px] object-cover"
              />
            </div>

            {generationPending && (
              <p role="status" className="text-center text-sm text-b-400">
                그림에 담을 꿈을 준비하고 있어요…
              </p>
            )}

            {flow.generation.data?.status === 'FAILED' && (
              <div className="flex flex-col gap-3">
                <p className="text-sm">꿈을 준비하지 못했어요. 기록은 저장되어 있어요.</p>

                <SecondaryButton disabled={busy} onClick={flow.retryGeneration}>
                  다시 준비하기
                </SecondaryButton>
              </div>
            )}

            {flow.generation.data?.sourceChanged && (
              <p className="text-sm">
                꿈 내용이 변경되었어요. 보관함에서 최신 기록을 확인해 주세요.
              </p>
            )}
          </>
        )}

        {screen === 'charge' && flow.dream && (
          <DreamCharge
            dreamId={flow.dream.dreamId}
            cost={cost ?? 3}
            canGenerate={flow.canGenerate && (flow.screen === 'result' || validChoice)}
            onContinue={continueAfterPayment}
            onBack={() => setView(validChoice ? 'offer' : 'style')}
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
                  className="mt-[54px] h-[200px] w-full rounded-2xl"
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
      </main>

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

        {(!ready || flow.saveError) && (
          <SecondaryButton disabled={busy} onClick={flow.restore}>
            서버 기록 다시 불러오기
          </SecondaryButton>
        )}

        {!ready && (
          <SecondaryButton onClick={() => navigate('/login')}>로그인하러 가기</SecondaryButton>
        )}

        {flow.dream?.recordStatus === 'COMPLETED' && screen !== 'charge' && (
          <>
            {flow.image.data?.status === 'FAILED' && (
              <p role="alert" className="mb-3 text-sm">
                이미지 생성에 실패했어요.{' '}
                {flow.image.data.hasPreviousResult
                  ? '이전 이미지는 유지돼요.'
                  : '꿈 기록은 저장되어 있어요.'}
              </p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={flow.refreshResults}
              className="mb-3 w-full text-xs text-b-400 underline"
            >
              상태 다시 조회
            </button>
          </>
        )}

        {screen === 'text' && (
          <PrimaryButton
            disabled={!draft.content.trim() || busy || !ready || flow.saveError}
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
              disabled={!draft.emotions.length || busy || !ready || flow.saveError}
              onClick={flow.handleNext}
            >
              다음
            </PrimaryButton>
          </div>
        )}

        {screen === 'style' && (
          <div className="flex flex-col gap-3">
            <PrimaryButton
              disabled={!validChoice || busy || flow.imageBusy}
              onClick={() => setView('offer')}
            >
              그림 완성하기
            </PrimaryButton>

            {!styles.length && (
              <SecondaryButton disabled={busy} onClick={flow.handleSaveWithoutImage}>
                다음에 만들어볼게요
              </SecondaryButton>
            )}
          </div>
        )}

        {screen === 'offer' && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={!canGenerate} onClick={generate}>
              그림으로 남기기
              <TokenCost amount={cost ?? 3} />
            </PrimaryButton>

            <SecondaryButton disabled={busy} onClick={flow.handleSaveWithoutImage}>
              다음에 만들어볼게요
            </SecondaryButton>
          </div>
        )}

        {finished && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={busy} onClick={() => navigate('/archive')}>
              보관함 보기
            </PrimaryButton>

            <SecondaryButton disabled={busy} onClick={() => navigate('/')}>
              홈으로 돌아가기
            </SecondaryButton>

            {screen === 'result' && (
              <SecondaryButton disabled={!canGenerate || cost === null} onClick={generate}>
                이미지 다시 생성하기
                <TokenCost amount={cost ?? 0} muted />
              </SecondaryButton>
            )}
          </div>
        )}

        {flow.imageBusy && (
          <SecondaryButton onClick={() => setLoadingClosed(false)}>
            이미지 생성 중 · 진행 상황 보기
          </SecondaryButton>
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
        <FlowModal title="이미지 생성 중" onClose={() => setLoadingClosed(true)}>
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

      {flow.modal === 'tokens' && (
        <FlowModal title="토큰이 부족해요" onClose={() => flow.setModal(null)}>
          <h2 className="text-center text-[18px] font-semibold">토큰이 부족해요!</h2>

          <dl className="my-6 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt>필요한 토큰</dt>
              <dd>{cost ?? '—'}개</dd>
            </div>

            <div className="flex justify-between">
              <dt>보유 토큰</dt>
              <dd>{tokens ?? '—'}개</dd>
            </div>

            <div className="flex justify-between border-t border-b-600 pt-3">
              <dt>부족한 토큰</dt>
              <dd>{cost == null || tokens == null ? '—' : Math.max(0, cost - tokens)}개</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={openCharge}>토큰 충전하기</PrimaryButton>

            <SecondaryButton
              onClick={() => {
                flow.setModal(null);
                flow.handleSaveWithoutImage();
              }}
            >
              다음에 만들어볼게요
            </SecondaryButton>
          </div>
        </FlowModal>
      )}
    </div>
  );
}

export default function DreamRecordPage() {
  const [params] = useSearchParams();

  return <DreamRecordFlow key={params.get('date') ?? toDateString(new Date())} />;
}
