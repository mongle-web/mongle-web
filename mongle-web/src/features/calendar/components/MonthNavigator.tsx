import { formatYearMonth } from '@/features/calendar/utils/calendar';

interface MonthNavigatorProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onTitleClick: () => void; // 연월(밑줄)을 누르면 날짜 선택 창 열기
}

interface TriangleIconProps {
  direction: 'left' | 'right';
}

function TriangleIcon({ direction }: TriangleIconProps) {
  return (
    <svg viewBox="0 0 12 16" className="h-4 w-3" fill="currentColor" aria-hidden="true">
      {direction === 'left' ? <path d="M0 8 12 0v16z" /> : <path d="M12 8 0 0v16z" />}
    </svg>
  );
}

// 피그마: 화살표 12x16, 글자와 간격 12px
// 버튼 크기는 화살표와 똑같이 두고, 손가락으로 누르기 쉽게 눌리는 영역만 after로 넓힘
const ARROW_BUTTON_CLASS_NAME =
  "relative flex h-4 w-3 cursor-pointer items-center justify-center after:absolute after:-inset-2 after:content-['']";

function MonthNavigator({ month, onPrev, onNext, onTitleClick }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-3 text-b-300">
      <button
        type="button"
        aria-label="이전 달"
        onClick={onPrev}
        className={ARROW_BUTTON_CLASS_NAME}
      >
        <TriangleIcon direction="left" />
      </button>

      <button
        type="button"
        aria-label={`${formatYearMonth(month)}, 날짜 선택 열기`}
        onClick={onTitleClick}
        className="cursor-pointer text-[18px] leading-[1.4] font-semibold underline decoration-1 underline-offset-4"
      >
        {formatYearMonth(month)}
      </button>

      <button
        type="button"
        aria-label="다음 달"
        onClick={onNext}
        className={ARROW_BUTTON_CLASS_NAME}
      >
        <TriangleIcon direction="right" />
      </button>
    </div>
  );
}

export default MonthNavigator;
