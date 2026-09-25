import mikeImage from '@/assets/images/home/mike.png';
import textReportImage from '@/assets/images/home/text_report.png';

interface RecordMethodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceClick: () => void;
  onTextClick: () => void;
}

function RecordMethodSheet({ isOpen, onClose, onVoiceClick, onTextClick }: RecordMethodSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="기록 방식 선택 닫기"
        onClick={onClose}
        className="absolute inset-0"
      />

      <section className="relative z-10 w-full max-w-[480px] rounded-t-[28px] bg-[#1D1A25] px-4 pt-3 pb-9">
        <div className="mx-auto mb-4 h-1 w-7 rounded-full bg-[#77727D]" />

        <div className="mb-4 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="이전 날짜"
            className="flex h-8 w-8 items-center justify-center text-[#F7F5FA]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <p className="text-sm font-semibold text-[#F7F5FA]">9월 23일 (수)</p>

          <button
            type="button"
            aria-label="다음 날짜"
            className="flex h-8 w-8 items-center justify-center text-[#F7F5FA]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onVoiceClick}
            className="relative h-[116px] overflow-hidden rounded-[20px] bg-[#292633] p-4 text-left transition active:scale-[0.98]"
          >
            <p className="relative z-10 text-[12px] font-medium text-[#F7F5FA]">
              음성으로 기록하기
            </p>

            <img
              src={mikeImage}
              alt=""
              className="absolute right-3 bottom-1 h-[72px] w-[96px] object-contain"
            />
          </button>

          <button
            type="button"
            onClick={onTextClick}
            className="relative h-[116px] overflow-hidden rounded-[20px] bg-[#292633] p-4 text-left transition active:scale-[0.98]"
          >
            <p className="relative z-10 text-[12px] font-medium text-[#F7F5FA]">
              텍스트로 기록하기
            </p>

            <img
              src={textReportImage}
              alt=""
              className="absolute right-2 bottom-1 h-[78px] w-[86px] object-contain"
            />
          </button>
        </div>
      </section>
    </div>
  );
}

export default RecordMethodSheet;
