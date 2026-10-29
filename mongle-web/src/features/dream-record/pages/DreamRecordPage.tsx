import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FlowModal, Glow, PrimaryButton, SecondaryButton, TokenCost } from '@/components/common';
import DreamImage from '@/components/common/DreamImage';

import DreamDatePicker from '../components/DreamDatePicker';
import EmotionSelector from '../components/EmotionSelector';
import { MAX_LENGTH, parseRecordDate, toDateString } from '../utils/dreamDraft';
import { useDreamRecord } from '../hooks/useDreamRecord';

const ASSET_PATH = '/dream-record/';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DreamRecordFlow() {
  const navigate = useNavigate();
  const flow = useDreamRecord();

  const {
    draft,
    screen,
    busy,
    ready,
    modal,
    setModal,
    message,
    setMessage,
    storageWarning,
    tokens,
    cost,
    updateDraft,
    toggleEmotion,
    handleNext,
    handleBack,
    selectDate,
    handleGenerate,
    handleSaveWithoutImage,
  } = flow;

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const selectedDate = parseRecordDate(draft.date) ?? new Date();
  const isFinished = screen === 'result' || screen === 'complete';
  const isGenerating = busy || flow.imageBusy;

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

          <button
            type="button"
            disabled={flow.dateLocked || !ready}
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

            {!flow.dateLocked && (
              <img src={`${ASSET_PATH}chevron.svg`} alt="" className="shrink-0 rotate-90" />
            )}
          </button>

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
                disabled={!ready || busy}
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
              가장 가까운 감정을 1~3개 선택해 주세요.
            </p>

            <div className="[&_button]:text-[18px]! [&_button]:font-semibold!">
              <EmotionSelector
                selected={draft.emotions}
                onToggle={toggleEmotion}
                disabled={busy || !ready}
              />
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

              <span className="text-[16px] leading-[1.3] font-semibold">{tokens ?? '—'}</span>
            </div>

            <section aria-live="polite" className="mt-5 rounded-2xl bg-n-900 p-4">
              <h2 className="text-[16px] font-semibold">꿈 분석 · 이야기</h2>

              {flow.generation.isPending && (
                <p className="mt-2 text-sm">생성 상태를 확인하고 있어요.</p>
              )}

              {['QUEUED', 'PROCESSING'].includes(flow.generation.data?.status ?? '') && (
                <p className="mt-2 text-sm">
                  {flow.generation.data?.stage === 'STORY'
                    ? '이야기를 만들고 있어요…'
                    : '꿈을 분석하고 있어요…'}{' '}
                  기록은 이미 저장되었어요.
                </p>
              )}

              {flow.generation.data?.status === 'FAILED' && (
                <>
                  <p className="mt-2 text-sm">
                    생성을 완료하지 못했어요. 기록은 저장되어 있어요. (
                    {flow.generation.data.failureCode})
                  </p>

                  <SecondaryButton disabled={busy} onClick={flow.retryGeneration}>
                    실패한 단계 다시 시도
                  </SecondaryButton>
                </>
              )}

              {flow.generation.data?.sourceChanged && (
                <p className="mt-2 text-sm">
                  원문이 변경되었어요. 보관함에서 최신 기록을 확인해 주세요.
                </p>
              )}

              {flow.analysis.data && (
                <>
                  <h3 className="mt-3 font-semibold">
                    {flow.dream?.title || flow.analysis.data.generatedTitle || '기록한 꿈'}
                  </h3>

                  <p className="mt-2 text-sm text-b-400">
                    {flow.analysis.data.displayKeywords.join(' · ')}
                  </p>

                  {flow.analysis.data.scenes.map((scene) => (
                    <p
                      key={scene.sequence}
                      className="mt-2 text-sm leading-relaxed whitespace-pre-wrap"
                    >
                      {scene.content}
                    </p>
                  ))}
                </>
              )}

              {flow.story.data?.sections.map((section) => (
                <p
                  key={section.sequence}
                  className="mt-3 text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {section.kind === 'AI_BRIDGE' && (
                    <span className="mr-1 text-b-400">[AI 연결]</span>
                  )}

                  {section.content}
                </p>
              ))}
            </section>

            <div className="mt-4 flex flex-col gap-3">
              <label className="text-sm">
                이미지 스타일
                <select
                  aria-label="이미지 스타일"
                  value={flow.selectedStyle}
                  onChange={(event) => flow.setStyle(event.target.value)}
                  disabled={isGenerating || !flow.options.data?.styles.length}
                  className="mt-2 w-full rounded-xl bg-n-900 p-3"
                >
                  {!flow.options.data?.styles.length && (
                    <option value="">사용 가능한 스타일이 없어요</option>
                  )}

                  {flow.options.data?.styles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </label>

              {!!flow.options.data?.moods.length && (
                <label className="text-sm">
                  분위기
                  <select
                    aria-label="이미지 분위기"
                    value={flow.selectedMood}
                    onChange={(event) => flow.setMood(event.target.value)}
                    disabled={isGenerating}
                    className="mt-2 w-full rounded-xl bg-n-900 p-3"
                  >
                    <option value="">기본 분위기</option>

                    {flow.options.data.moods.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {flow.balance.data?.spendingBlocked && (
                <p role="alert" className="text-sm">
                  결제 확인 중으로 이미지 생성을 사용할 수 없어요.
                </p>
              )}

              <p className="text-xs text-b-400">
                최초 생성 기본 비용은 3크레딧이며, 실제 처리 여부는 서버 응답으로 확인해요.
              </p>
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
              flow.download.data ? (
                <DreamImage
                  key={flow.download.data?.url}
                  src={flow.download.data?.url ?? ''}
                  alt="꿈 이미지"
                  className="mt-[54px] h-[200px] w-full rounded-2xl"
                />
              ) : (
                <p className="mt-8 text-sm">
                  이미지 주소를 불러오고 있어요. 실패하면 상태 다시 조회를 눌러 주세요.
                </p>
              )
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

        {(!ready || flow.saveError) && (
          <SecondaryButton disabled={busy} onClick={flow.restore}>
            서버 기록 다시 불러오기
          </SecondaryButton>
        )}

        {!ready && (
          <SecondaryButton onClick={() => navigate('/login')}>로그인하러 가기</SecondaryButton>
        )}

        {flow.dream?.recordStatus === 'COMPLETED' && (
          <>
            {flow.imageBusy && (
              <p role="status" className="mb-3 text-center text-sm">
                이미지 생성 중이에요. 기록은 이미 저장되어 있어요.
              </p>
            )}

            {flow.image.data?.status === 'FAILED' && (
              <p role="alert" className="mb-3 text-center text-sm">
                이미지 생성에 실패했어요.{' '}
                {flow.image.data.hasPreviousResult
                  ? '이전 이미지는 유지돼요.'
                  : '그림 없이도 꿈 기록은 저장되어 있어요.'}{' '}
                ({flow.image.data.failureCode})
              </p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={flow.refreshResults}
              className="mb-3 w-full text-sm underline"
            >
              상태 다시 조회
            </button>
          </>
        )}

        {screen === 'text' && (
          <PrimaryButton
            disabled={!draft.content.trim() || busy || !ready || flow.saveError}
            onClick={handleNext}
          >
            다음
          </PrimaryButton>
        )}

        {screen === 'emotion' && (
          <div className="flex items-center justify-between gap-4">
            <SecondaryButton disabled={busy} onClick={handleBack} className="w-[109px]">
              이전
            </SecondaryButton>

            <PrimaryButton
              disabled={draft.emotions.length === 0 || busy || !ready || flow.saveError}
              onClick={handleNext}
              className="w-[109px]"
            >
              다음
            </PrimaryButton>
          </div>
        )}

        {screen === 'image' && (
          <div className="flex flex-col gap-3">
            <PrimaryButton disabled={!flow.canGenerate} onClick={handleGenerate}>
              그림으로 남기기
              <TokenCost amount={cost ?? 3} />
            </PrimaryButton>

            <SecondaryButton disabled={busy} onClick={handleSaveWithoutImage}>
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
              <SecondaryButton
                disabled={!flow.canGenerate || cost === null}
                onClick={handleGenerate}
              >
                이미지 다시 생성하기
                <TokenCost muted amount={cost ?? 0} />
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

      {modal === 'tokens' && (
        <FlowModal title="토큰이 부족해요" onClose={() => setModal(null)}>
          <h2 className="text-center text-[18px] leading-[1.4] font-semibold">토큰이 부족해요!</h2>

          <dl className="mt-10 mb-4 flex flex-col gap-2 text-[12px] leading-[1.5] text-b-300">
            <div className="flex items-center justify-between">
              <dt>필요한 토큰</dt>
              <dd>{cost ?? '확인 중'}개</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt>보유 토큰</dt>
              <dd>{tokens ?? '확인 중'}개</dd>
            </div>

            <div className="flex items-center justify-between border-t border-t-b-600 pt-2">
              <dt>부족한 토큰</dt>
              <dd>{tokens == null || cost == null ? '확인 중' : Math.max(0, cost - tokens)}개</dd>
            </div>
          </dl>

          <p className="text-center text-sm leading-relaxed">
            충전·광고 보상 기능은 아직 연결되지 않았어요. 꿈 기록은 저장되어 있으니 이미지는 나중에
            만들 수 있어요.
          </p>

          <SecondaryButton onClick={() => setModal(null)}>확인</SecondaryButton>
        </FlowModal>
      )}
    </div>
  );
}

function DreamRecordPage() {
  const [params] = useSearchParams();

  return <DreamRecordFlow key={params.get('date') ?? toDateString(new Date())} />;
}

export default DreamRecordPage;
