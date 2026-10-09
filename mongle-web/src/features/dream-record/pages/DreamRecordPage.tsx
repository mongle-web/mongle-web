
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DreamDatePicker from '@/features/dream-record/components/DreamDatePicker';

type RecordStep = 'text' | 'emotion' | 'image' | 'complete';

type Emotion = '행복' | '편안함' | '설렘' | '슬픔' | '불안' | '화남' | '당황';

interface DreamDraft {
  date: string;
  content: string;
  emotion: Emotion | null;
  imageRequested: boolean;
}

const EMOTIONS: Emotion[] = [
  '행복',
  '편안함',
  '설렘',
  '슬픔',
  '불안',
  '화남',
  '당황',
];

const MAX_LENGTH = 500;
const DRAFT_KEY = 'mongle:dream-record-draft';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

  const [step, setStep] = useState<RecordStep>('text');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [message, setMessage] = useState('');

  const saveDraft = (imageRequested: boolean) => {
    const draft: DreamDraft = {
      date: toDateString(selectedDate),
      content: content.trim(),
      emotion,
      imageRequested,
    };

    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      return true;
    } catch {
      setMessage('임시 기록을 저장하지 못했습니다.');
      return false;
    }
  };

  const handleBack = () => {
    setMessage('');

    if (step === 'complete') {
      setStep('image');
    } else if (step === 'image') {
      setStep('emotion');
    } else if (step === 'emotion') {
      setStep('text');
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

      setStep('emotion');
      return;
    }

    if (step === 'emotion') {
      if (!emotion) {
        setMessage('꿈에서 느꼈던 감정을 선택해 주세요.');
        return;
      }

      setStep('image');
    }
  };

  const handleSkipImage = () => {
    if (saveDraft(false)) {
      setStep('complete');
    }
  };

  const handleGenerateImage = () => {
    if (saveDraft(true)) {
      setMessage(
        '이미지 생성 요청을 위한 기록을 준비했습니다. 실제 이미지 생성은 API 연결 후 이용할 수 있습니다.',
      );
    }
  };

  const canProceed =
    step === 'text'
      ? content.trim().length > 0
      : step === 'emotion'
        ? emotion !== null
        : false;

  return (
    <div className="flex min-h-dvh flex-col bg-b-900 text-b-200">
      {/* 상단 헤더 */}
      <header className="flex h-[68px] shrink-0 items-center justify-between px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="이전 화면"
          className="flex h-10 w-10 items-center justify-start"
        >
          <BackIcon />
        </button>

        {step !== 'complete' ? (
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-1 text-[16px] font-medium"
          >
            {formatDate(selectedDate)}
            <span className="ml-1 text-b-400">⌄</span>
          </button>
        ) : (
          <span className="text-[16px] font-medium">꿈 기록</span>
        )}

        <div className="w-10" />
      </header>

      <main className="flex flex-1 flex-col px-5 pt-8">
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

            <section className="mt-8">
              <label htmlFor="dream-content" className="sr-only">
                꿈 내용
              </label>

              <div className="flex h-[262px] flex-col rounded-[24px] bg-n-900 p-5">
                <textarea
                  id="dream-content"
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
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

            <section
              aria-label="꿈 감정 선택"
              className="mt-10 flex flex-col gap-3"
            >
              {EMOTIONS.map((item) => {
                const isSelected = emotion === item;

                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setEmotion(item);
                      setMessage('');
                    }}
                    className={[
                      'flex h-14 shrink-0 items-center rounded-[16px] px-[22px]',
                      'text-left text-[18px] font-semibold transition-colors',
                      isSelected
                        ? 'bg-p-100 text-p-900'
                        : 'bg-n-900 text-b-400 hover:bg-n-800',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                );
              })}
            </section>
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
              <span className="text-[16px] font-semibold">2</span>
              <span className="text-[12px] text-b-400">피그마 예시</span>
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

      {/* 하단 액션 */}
      <footer className="sticky bottom-0 bg-b-900 px-5 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        {message && (
          <p role="status" className="mb-4 text-center text-[13px] leading-[1.5] text-b-300">
            {message}
          </p>
        )}

        {(step === 'text' || step === 'emotion') && (
          <div className={step === 'emotion' ? 'flex items-center justify-between gap-4' : ''}>
            {step === 'emotion' && (
              <button
                type="button"
                onClick={handleBack}
                className="h-12 flex-1 text-[16px] font-semibold text-b-400"
              >
                이전
              </button>
            )}

            <button
              type="button"
              disabled={!canProceed}
              onClick={handleNext}
              className={[
                'h-14 rounded-[16px] text-[16px] font-semibold transition-colors',
                step === 'emotion' ? 'flex-1' : 'w-full',
                canProceed
                  ? 'bg-n-200 text-p-900 active:bg-n-300'
                  : 'cursor-not-allowed bg-n-800 text-b-400',
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
          onChange={setSelectedDate}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}
    </div>
  );
}

export default DreamRecordPage;
