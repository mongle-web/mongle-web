import CalendarDayCell from '@/features/calendar/components/CalendarDayCell';
import type { CalendarDay } from '@/features/calendar/types/calendar';
import { splitIntoWeeks, WEEKDAYS } from '@/features/calendar/utils/calendar';

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDateKey?: string | null;
  onDayClick?: (day: CalendarDay) => void;
}

function CalendarGrid({ days, selectedDateKey = null, onDayClick }: CalendarGridProps) {
  const weeks = splitIntoWeeks(days);

  return (
    <div className="w-full">
      {/* 요일 */}
      <div className="flex h-10 items-center gap-2">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="flex-1 text-center text-[12px] leading-[1.5] font-medium text-b-400"
          >
            {weekday}
          </span>
        ))}
      </div>

      {/* 날짜 */}
      <div className="flex flex-col gap-2">
        {weeks.map((week) => (
          <div key={week[0].dateKey} className="flex gap-2">
            {week.map((day) => (
              <CalendarDayCell
                // 같은 날짜라도 이미지 주소가 바뀌면 로딩 상태를 처음부터 다시 계산
                key={`${day.dateKey}-${day.dream?.thumbnailUrl ?? ''}`}
                day={day}
                isSelected={day.dateKey === selectedDateKey}
                onClick={onDayClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarGrid;
