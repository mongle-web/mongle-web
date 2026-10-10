import { formatYearMonth } from '@/features/calendar/utils/calendar';

interface MonthNavigatorProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
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

function MonthNavigator({ month, onPrev, onNext }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-3 text-b-300">
      <button
        type="button"
        aria-label="이전 달"
        onClick={onPrev}
        className="flex h-6 w-6 cursor-pointer items-center justify-center"
      >
        <TriangleIcon direction="left" />
      </button>

      <h2 className="text-[18px] leading-[1.4] font-semibold underline decoration-1 underline-offset-4">
        {formatYearMonth(month)}
      </h2>
      <button
        type="button"
        aria-label="다음 달"
        onClick={onNext}
        className="flex h-6 w-6 cursor-pointer items-center justify-center"
      >
        <TriangleIcon direction="right" />
      </button>
    </div>
  );
}

export default MonthNavigator;
