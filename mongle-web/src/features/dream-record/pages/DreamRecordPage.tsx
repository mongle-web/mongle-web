import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FlowModal, Glow, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';
import DreamImage from '@/components/common/DreamImage';
import DreamDatePicker from '@/features/dream-record/components/DreamDatePicker';
import EmotionSelector from '@/features/dream-record/components/EmotionSelector';
import {
  MAX_EMOTIONS,
  MAX_LENGTH,
  parseRecordDate,
  readDraft,
  toDateString,
  writeDraft,
  type DreamDraft,
  type Emotion,
} from '@/features/dream-record/utils/dreamDraft';

type Screen = 'text' | 'emotion' | 'image' | 'result' | 'complete' | 'charge';

type ModalType = 'loading' | 'tokens' | null;

const ASSET_PATH = '/dream-record/';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DreamRecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [initial] = useState(() => {
    const date = parseRecordDate(searchParams.get('date')) ?? new Date();

    return readDraft(toDateString(date));
  });

  const [draft, setDraft] = useState<DreamDraft>(initial.draft);
  const [screen, setScreen] = useState<Screen>(initial.draft.step);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [message, setMessage] = useState('');
  const [storageWarning, setStorageWarning] = useState(initial.warning);

  // API 연결 전 피그마 화면용 값.
  const [tokens, setTokens] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const generationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationLock = useRef(false);
  const chargeReturnScreen = useRef<'image' | 'result'>('image');

  const selectedDate = parseRecordDate(draft.date) ?? new Date();
  const isFinished = screen === 'result' || screen === 'complete';

  useEffect(() => {
    return () => {
      if (generationTimer.current !== null) {
        clearTimeout(generationTimer.current);
      }
    };
  }, []);

  function updateDraft(changes: Partial<DreamDraft>) {
    const next = { ...draft, ...changes };

    setDraft(next);

    setStorageWarning(
      writeDraft(next) ? '' : '임시 보관에 실패했어요. 화면을 나가면 작성 내용이 사라질 수 있어요.',
    );
  }

  function changeScreen(next: 'text' | 'emotion' | 'image') {
    updateDraft({ step: next });
    setScreen(next);
    setMessage('');
  }

  function selectDate(date: Date) {
    const dateKey = toDateString(date);

    if (dateKey === draft.date) return;

    if (!writeDraft(draft)) {
      setStorageWarning('현재 기록을 임시 보관하지 못했어요. 다시 시도해 주세요.');
      return;
    }

    const restored = readDraft(dateKey);

    setDraft(restored.draft);
    setScreen(restored.draft.step);
    setStorageWarning(restored.warning);
    setMessage('');

    setSearchParams(
      (current) => {
        current.set('date', dateKey);
        return current;
      },
      { replace: true },
    );
  }

  function handleBack() {
    if (generationLock.current) return;

    setMessage('');

    if (screen === 'charge') {
      setScreen(chargeReturnScreen.current);
      return;
    }

    if (screen === 'image') {
      changeScreen('emotion');
      return;
    }

    if (screen === 'emotion') {
      changeScreen('text');
      return;
    }

    navigate('/');
  }

  function toggleEmotion(emotion: Emotion) {
    if (draft.emotions.includes(emotion)) {
      updateDraft({
        emotions: draft.emotions.filter((item) => item !== emotion),
        imageRequested: false,
      });
      setMessage('');
      return;
    }

    if (draft.emotions.length >= MAX_EMOTIONS) {
      setMessage(`감정은 최대 ${MAX_EMOTIONS}개까지 선택할 수 있어요.`);
      return;
    }

    updateDraft({
      emotions: [...draft.emotions, emotion],
      imageRequested: false,
    });
    setMessage('');
  }

  function handleNext() {
    if (screen === 'text') {
      if (!draft.content.trim()) return;

      changeScreen('emotion');
      return;
    }

    if (screen === 'emotion') {
      if (draft.emotions.length === 0) return;

      changeScreen('image');
    }
  }

  function startGeneration(availableTokens: number) {
    if (generationLock.current) return;

    setMessage('');

    if (availableTokens < 1) {
      setModal('tokens');
      return;
    }

    generationLock.current = true;

    setIsGenerating(true);
    setModal('loading');

    updateDraft({
      imageRequested: true,
      step: 'image',
    });

    // API 연결 시 이미지 생성 응답을 받은 뒤 결과 화면으로 이동한다.
    // 현재는 프론트 화면 연결만 처리한다.
    generationTimer.current = setTimeout(() => {
      setTokens(availableTokens - 1);
      setImageVersion((value) => value + 1);
      setScreen('result');
      setModal(null);
      setIsGenerating(false);

      generationLock.current = false;
      generationTimer.current = null;
    }, 1500);
  }

  function handleGenerate() {
    chargeReturnScreen.current = screen === 'result' ? 'result' : 'image';

    startGeneration(tokens);
  }

  function handleCharge(amount: number) {
    if (generationLock.current) return;

    // 실제 결제 연동 전 화면 전환.
    const nextTokens = tokens + amount;

    setTokens(nextTokens);
    setScreen(chargeReturnScreen.current);

    startGeneration(nextTokens);
  }

  function handleReward() {
    if (generationLock.current) return;

    // 광고 SDK 연결 시 보상 완료 콜백에서 실행할 부분.
    const nextTokens = tokens + 1;

    setTokens(nextTokens);
    startGeneration(nextTokens);
  }

  function handleSaveWithoutImage() {
    if (generationLock.current) return;

    updateDraft({
      imageRequested: false,
      step: 'image',
    });

    setMessage('');

    // API 연결 시 저장 성공 응답을 받은 뒤 이동한다.
    setScreen('complete');
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-b-900 pt-[env(safe-area-inset-top)] text-b-200">
      {!isFinished && (
        <header className="grid h-11 shrink-0 grid-cols-[28px_minmax(0,1fr)_28px] items-center px-5">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleBack}
            aria-label="이전 화면"
            className="flex size-7 items-center justify-center bg-transparent"
          >
            <img src={`${ASSET_PATH}back.svg`} alt="" className="rotate-180" />
          </button>

          {screen === 'charge' ? (
            <span className="justify-self-center text-[16px] leading-6 font-medium">토큰 충전</span>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setDatePickerOpen(true)}
              aria-label="꿈 기록 날짜 선택"
              aria-haspopup="dialog"
              aria-expanded={datePickerOpen}
              className="inline-flex h-11 items-center justify-center gap-1 justify-self-center bg-transparent"
            >
              <span className="text-[16px] leading-6 font-medium whitespace-nowrap">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일{' '}
                {WEEKDAYS[selectedDate.getDay()]}요일
              </span>

              <img src={`${ASSET_PATH}chevron.svg`} alt="" className="shrink-0 rotate-90" />
            </button>
          )}

          <span aria-hidden="true" className="size-7" />
        </header>
      )}

      <div className={['flex-1 px-5', isFinished ? 'pt-[154px] text-center' : 'pt-5'].join(' ')}>
        {screen === 'text' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">오늘 밤, 무엇을 보았나요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] font-medium text-b-600">
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
                maxLength={MAX_LENGTH}
                placeholder="꿈의 내용을 자유롭게 작성해 주세요."
                onChange={(event) => {
                  updateDraft({
                    content: event.target.value,
                    imageRequested: false,
                  });
                  setMessage('');
                }}
                className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent text-[14px]! leading-[1.5]! text-b-200 outline-none placeholder:text-b-600"
              />

              <p className="mt-3 text-right text-[12px] text-b-600">
                {draft.content.length} / {MAX_LENGTH}
              </p>
            </div>
          </>
        )}

        {screen === 'emotion' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">꿈속에서의 감정은 어땠나요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] font-medium text-b-600">
              꿈에서 느꼈던 순간의 감정을 떠올려보고
              <br />
              가장 가까운 감정을 선택해 주세요.
            </p>

            <div className="[&_button]:text-[18px]! [&_button]:font-semibold!">
              <EmotionSelector selected={draft.emotions} onToggle={toggleEmotion} />
            </div>
          </>
        )}

        {screen === 'image' && (
          <>
            <h1 className="text-[18px] leading-[1.4] font-semibold">이 꿈, 그림으로 남겨볼까요?</h1>

            <p className="mt-3 text-[14px] leading-[1.5] font-medium text-b-600">
              꿈에서 기억나는 장면과 분위기를 담아
              <br />
              나만의 꿈 이미지로 만들어보세요.
            </p>

            <div
              aria-label={`보유 토큰 ${tokens}개`}
              className="mt-4 flex w-fit items-center gap-1.5 rounded-full px-2 py-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
            >
              <img src={`${ASSET_PATH}coin.svg`} alt="" />

              <span className="text-[16px] leading-[1.3] font-semibold">{tokens}</span>
            </div>

            <div className="relative mt-[50px] h-[274px] w-full">
              <Glow className="top-[-49px]" />

              <img
                src={`${ASSET_PATH}painter.png`}
                alt="꿈을 그리는 몽글"
                width={223}
                height={200}
                className="absolute top-[21px] left-[calc(50%-3px)] h-[200px] w-[223px] max-w-none -translate-x-1/2 object-cover"
              />
            </div>
          </>
        )}

        {isFinished && (
          <>
            <h1 className="text-[20px] leading-[1.4] font-semibold">
              {screen === 'result' ? '꿈 이미지가 완성되었어요' : '기록한 꿈을 저장했어요'}
            </h1>

            <p className="mt-3 text-[16px] leading-[1.5] font-medium text-b-400">
              보관함에 소중히 담아두었어요.
            </p>

            {screen === 'result' ? (
              <DreamImage
                key={imageVersion}
                src={`${ASSET_PATH}dream-art.png`}
                alt="꿈 이미지"
                className="mt-[54px] h-[200px] w-full rounded-2xl"
              />
            ) : (
              <div className="relative mt-[67px] h-[270px]">
                <Glow className="top-[-90px]" />

                <img
                  src={`${ASSET_PATH}saved.png`}
                  alt="꿈 기록을 반기는 몽글"
                  width={188}
                  height={169}
                  className="relative mx-auto h-[169px] w-[188px] object-cover"
                />
              </div>
            )}
          </>
        )}

        {screen === 'charge' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between rounded-2xl bg-n-900 px-5 py-4">
              <span className="text-[14px] leading-[1.5] font-medium text-b-600">보유 토큰</span>

              <span className="text-[14px] leading-[1.5] font-semibold">{tokens} 개</span>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl bg-n-900 px-5 py-4">
              {[1, 5, 10].map((amount) => (
                <div key={amount} className="flex items-center justify-between">
                  <span className="text-[14px] leading-[1.5] font-medium">{amount} 토큰</span>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleCharge(amount)}
                    aria-label={`${amount} 토큰 충전`}
                    className="w-[100px] rounded-full bg-p-500 px-4 py-2 text-[14px]! leading-[1.3]! font-semibold! text-b-200 disabled:opacity-40"
                  >
                    1,000원
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 z-10 bg-b-900 px-5 pt-2.5 pb-[max(8px,env(safe-area-inset-bottom))]">
        {storageWarning && (
          <p role="alert" className="mb-3 text-center text-[13px] leading-[1.5] text-b-300">
            {storageWarning}
          </p>
        )}

        {message && (
          <p role="status" className="mb-3 text-center text-[13px] leading-[1.5] text-b-300">
            {message}
          </p>
        )}

        {isGenerating && modal !== 'loading' && (
          <SecondaryButton onClick={() => setModal('loading')}>
            생성 중이에요 · 진행 상황 보기
          </SecondaryButton>
        )}

        {screen === 'text' && (
          <PrimaryButton disabled={!draft.content.trim()} onClick={handleNext}>
            다음
          </PrimaryButton>
        )}

        {screen === 'emotion' && (
          <div className="flex items-center justify-between gap-4">
            <SecondaryButton onClick={handleBack} className="w-[109px]">
              이전
            </SecondaryButton>

            <PrimaryButton
              disabled={draft.emotions.length === 0}
              onClick={handleNext}
              className="w-[109px]"
            >
              다음
            </PrimaryButton>
          </div>
        )}

        {screen === 'image' && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={isGenerating} onClick={handleGenerate}>
              그림으로 남기기
              <TokenCost />
            </PrimaryButton>

            <SecondaryButton disabled={isGenerating} onClick={handleSaveWithoutImage}>
              다음에 만들어볼게요
            </SecondaryButton>
          </div>
        )}

        {isFinished && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={isGenerating} onClick={() => navigate('/')}>
              홈으로 돌아가기
            </PrimaryButton>

            {screen === 'result' && (
              <SecondaryButton disabled={isGenerating} onClick={handleGenerate}>
                이미지 다시 생성하기
                <TokenCost muted />
              </SecondaryButton>
            )}
          </div>
        )}
      </footer>

      {datePickerOpen && (
        <DreamDatePicker
          value={selectedDate}
          onChange={selectDate}
          onClose={() => setDatePickerOpen(false)}
        />
      )}

      {modal === 'loading' && (
        <FlowModal title="이미지 생성 중" onClose={() => setModal(null)}>
          <button
            type="button"
            onClick={() => setModal(null)}
            aria-label="진행 창 닫기"
            className="mb-5 ml-auto flex size-7 items-center justify-center bg-transparent"
          >
            <img src={`${ASSET_PATH}close.svg`} alt="" />
          </button>

          <div className="relative mx-auto mb-3 h-[112px] w-[146px] overflow-hidden">
            <img
              src={`${ASSET_PATH}painter.png`}
              alt=""
              className="absolute top-[-13px] left-0 h-[131px] w-[146px] max-w-none"
            />
          </div>

          <h2 role="status" className="text-center text-[18px] leading-[1.4] font-semibold">
            이미지를 생성하고 있어요...
          </h2>
        </FlowModal>
      )}

      {modal === 'tokens' && (
        <FlowModal title="토큰이 부족해요" onClose={() => setModal(null)}>
          <h2 className="text-center text-[18px] leading-[1.4] font-semibold">토큰이 부족해요!</h2>

          <dl className="mt-10 mb-4 flex flex-col gap-2 text-[12px] leading-[1.5] text-b-300">
            <div className="flex items-center justify-between">
              <dt>필요한 토큰</dt>
              <dd>1개</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt>보유 토큰</dt>
              <dd>{tokens}개</dd>
            </div>

            <div className="flex items-center justify-between border-t border-t-b-600 pt-2">
              <dt>부족한 토큰</dt>
              <dd>{Math.max(0, 1 - tokens)}개</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setModal(null);
                setScreen('charge');
              }}
              className="min-h-9 w-full rounded-lg border! border-solid! border-white/40! bg-p-500 px-2.5 py-2 text-[14px]! leading-[1.3]! font-semibold! text-b-200"
            >
              충전하고 바로 생성하기
            </button>

            <button
              type="button"
              onClick={handleReward}
              className="min-h-9 w-full rounded-lg border! border-solid! border-white/40! bg-n-200 px-2.5 py-2 text-[14px]! leading-[1.3]! font-semibold! text-p-900"
            >
              광고 시청 후 생성하기
            </button>
          </div>
        </FlowModal>
      )}
    </div>
  );
}

export default DreamRecordPage;
