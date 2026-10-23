import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  type RecordStep,
} from '@/features/dream-record/utils/dreamDraft';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function BackIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function DreamRecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [initial] = useState(() => {
    const date = parseRecordDate(searchParams.get('date')) ?? new Date();

    return readDraft(toDateString(date));
  });

  const [draft, setDraft] = useState<DreamDraft>(initial.draft);
  const [step, setStep] = useState<RecordStep>(initial.draft.step);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [storageWarning, setStorageWarning] = useState(initial.warning);

  const selectedDate = parseRecordDate(draft.date) ?? new Date();
  const { content, emotions } = draft;

  const updateDraft = (changes: Partial<DreamDraft>) => {
    const next = {
      ...draft,
      ...changes,
    };

    setDraft(next);

    const saved = writeDraft(next);

    setStorageWarning(
      saved
        ? ''
        : '임시 보관에 실패했어요. 화면을 나가면 작성 내용이 사라질 수 있어요.',
    );

    return saved;
  };

  const changeStep = (nextStep: RecordStep) => {
    setStep(nextStep);

    updateDraft({
      step: nextStep === 'complete' ? 'image' : nextStep,
    });
  };

  const selectDate = (date: Date) => {
    const dateKey = toDateString(date);

    if (dateKey === draft.date) {
      return;
    }

    if (!updateDraft({})) {
      return;
    }

    const restored = readDraft(dateKey);

    setDraft(restored.draft);
    setStep(restored.draft.step);
    setStorageWarning(restored.warning);
    setMessage('');

    setSearchParams(
      {
        date: dateKey,
      },
      {
        replace: true,
      },
    );
  };

  const handleBack = () => {
    setMessage('');

    if (step === 'complete') {
      changeStep('image');
    } else if (step === 'image') {
      changeStep('emotion');
    } else if (step === 'emotion') {
      changeStep('text');
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    setMessage('');

    if (step === 'text') {
      if (!content.trim()) {
        setMessage('꿈의 내용을 작성해 주세요.');
        return;
      }

      changeStep('emotion');
      return;
    }

    if (step === 'emotion') {
      if (emotions.length === 0) {
        setMessage('꿈에서 느꼈던 감정을 선택해 주세요.');
        return;
      }

      changeStep('image');
    }
  };

  const toggleEmotion = (emotion: Emotion) => {
    if (emotions.includes(emotion)) {
      updateDraft({
        emotions: emotions.filter((item) => item !== emotion),
        imageRequested: false,
      });

      setMessage('');
      return;
    }

    if (emotions.length >= MAX_EMOTIONS) {
      setMessage(`감정은 최대 ${MAX_EMOTIONS}개까지 선택할 수 있어요.`);
      return;
    }

    updateDraft({
      emotions: [...emotions, emotion],
      imageRequested: false,
    });

    setMessage('');
  };

  const handleSkipImage = () => {
    setMessage('');

    const saved = updateDraft({
      imageRequested: false,
      step: 'image',
    });

    if (saved) {
      setStep('complete');
    }
  };

  const handleGenerateImage = () => {
    if (updateDraft({ imageRequested: true })) {
      setMessage(
        '이미지 생성 요청을 위한 기록을 준비했습니다. 실제 이미지 생성은 API 연결 후 이용할 수 있습니다.',
      );
    }
  };

  const canProceed =
    step === 'text'
      ? content.trim().length > 0
      : step === 'emotion'
        ? emotions.length > 0
        : false;

  return (
    <div className="flex min-h-dvh flex-col bg-b-900 text-b-200">
      <header className="grid h-11 shrink-0 grid-cols-[28px_minmax(0,1fr)_28px] items-center px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="이전 화면"
          className="flex size-7 items-center justify-center"
        >
          <BackIcon />
        </button>

        {step !== 'complete' ? (
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            aria-label="꿈 기록 날짜 선택"
            aria-haspopup="dialog"
            aria-expanded={isDatePickerOpen}
            className="inline-flex h-11 items-center justify-center gap-1 justify-self-center text-b-200"
          >
            <span className="text-[16px] leading-6 font-medium whitespace-nowrap">
              {formatDate(selectedDate)}
            </span>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="block size-6 shrink-0"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span className="justify-self-center text-[16px] leading-6 font-medium">
            꿈 기록
          </span>
        )}

        <div aria-hidden="true" className="size-7" />
      </header>

      <main className="flex flex-1 flex-col px-5 pt-5">
        {step === 'text' && (
          <>
            <section>
              <h1 className="text-[18px] leading-[1.4] font-semibold">
                오늘 밤, 무엇을 보았나요?
              </h1>

              <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
                꿈에서 기억나는 순간들을
                <br />
                떠오르는 대로 편하게 작성해보세요.
              </p>
            </section>

            <section className="mt-6">
              <label htmlFor="dream-content" className="sr-only">
                꿈 내용
              </label>

              <div className="flex h-[262px] flex-col rounded-[24px] bg-n-900 p-5">
                <textarea
                  id="dream-content"
                  value={content}
                  onChange={(event) => {
                    updateDraft({
                      content: event.target.value,
                      imageRequested: false,
                    });

                    setMessage('');
                  }}
                  placeholder="꿈의 내용을 자유롭게 작성해 주세요."
                  maxLength={MAX_LENGTH}
                  className="w-full flex-1 resize-none bg-transparent text-[14px] leading-[1.5] text-b-200 outline-none placeholder:text-b-600"
                />

                <p className="mt-3 text-right text-[12px] text-b-600">
                  {content.length} / {MAX_LENGTH}
                </p>
              </div>
            </section>
          </>
        )}

        {step === 'emotion' && (
          <>
            <section>
              <h1 className="text-[18px] leading-[1.4] font-semibold">
                꿈속에서의 감정은 어땠나요?
              </h1>

              <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
                꿈에서 느꼈던 순간의 감정을 떠올려보고
                <br />
                가장 가까운 감정을 선택해 주세요.
              </p>
            </section>

            <EmotionSelector
              selected={emotions}
              onToggle={toggleEmotion}
            />
          </>
        )}

        {step === 'image' && (
          <>
            <section>
              <h1 className="text-[18px] leading-[1.4] font-semibold">
                이 꿈, 그림으로 남겨볼까요?
              </h1>

              <p className="mt-3 text-[14px] leading-[1.5] text-b-600">
                꿈에서 기억나는 장면과 분위기를 담아
                <br />
                나만의 꿈 이미지로 만들어보세요.
              </p>
            </section>

            <div className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-n-900 px-3 py-2">
              <span className="text-p-300">●</span>
              <span className="text-[14px] font-medium">보유 토큰</span>
              <span className="text-[12px] text-b-400">확인 전</span>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-[245px] w-[260px] flex-col items-center justify-center rounded-[30px] bg-n-900">
                <svg
                  viewBox="0 0 100 100"
                  width="90"
                  height="90"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="12"
                    y="18"
                    width="76"
                    height="64"
                    rx="12"
                    stroke="#BCB3FF"
                    strokeWidth="3"
                  />

                  <circle cx="37" cy="40" r="8" fill="#7A6CE3" />

                  <path
                    d="M20 71 43 51 57 63 70 44 82 60"
                    stroke="#BCB3FF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p className="mt-4 text-[13px] text-b-400">
                  꿈을 그림으로 표현해 보세요
                </p>
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-n-800 text-[36px] text-p-300">
              ✓
            </div>

            <h1 className="mt-7 text-[22px] font-semibold">
              꿈 내역을 임시로 보관했어요
            </h1>

            <p className="mt-3 text-[14px] leading-[1.6] text-b-400">
              입력한 꿈과 감정을 브라우저에 임시 보관했습니다.
              <br />
              서버 저장은 API 연결 후 지원됩니다.
            </p>
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 bg-b-900 px-5 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        {storageWarning && (
          <p
            role="alert"
            className="mb-4 text-center text-[13px] leading-[1.5] text-b-300"
          >
            {storageWarning}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mb-4 text-center text-[13px] leading-[1.5] text-b-300"
          >
            {message}
          </p>
        )}

        {(step === 'text' || step === 'emotion') && (
          <div
            className={
              step === 'emotion'
                ? 'flex items-center justify-between gap-4'
                : ''
            }
          >
            {step === 'emotion' && (
              <button
                type="button"
                onClick={handleBack}
                className="h-12 w-[109px] text-[16px] font-semibold text-b-400"
              >
                이전
              </button>
            )}

            <button
              type="button"
              disabled={!canProceed}
              onClick={handleNext}
              style={{
                border: '2px solid rgba(255,255,255,0.4)',
              }}
              className={[
                'h-14 rounded-[16px] text-[16px] font-semibold transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-p-300',
                step === 'emotion' ? 'w-[109px]' : 'w-full',
                canProceed
                  ? 'bg-p-500 text-b-200 shadow-[0_0_8px_rgba(255,255,255,0.25)] active:bg-p-900'
                  : 'cursor-not-allowed bg-n-200 text-b-200',
              ].join(' ')}
            >
              다음
            </button>
          </div>
        )}

        {step === 'image' && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGenerateImage}
              className="flex h-14 items-center justify-center gap-3 rounded-[16px] border-2 border-white/30 bg-p-500 text-[16px] font-semibold shadow-[0_0_8px_rgba(255,255,255,0.25)]"
            >
              그림으로 남기기
              <span className="text-[14px]">● 1</span>
            </button>

            <button
              type="button"
              onClick={handleSkipImage}
              className="h-11 text-[16px] font-semibold text-b-400"
            >
              다음에 만들어볼게요
            </button>
          </div>
        )}

        {step === 'complete' && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-14 w-full rounded-[16px] bg-n-200 text-[16px] font-semibold text-p-900"
          >
            홈으로 돌아가기
          </button>
        )}
      </footer>

      {isDatePickerOpen && (
        <DreamDatePicker
          value={selectedDate}
          onChange={selectDate}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}
    </div>
  );
}

export default DreamRecordPage;