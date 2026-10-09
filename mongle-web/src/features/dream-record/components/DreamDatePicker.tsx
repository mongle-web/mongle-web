
import { useState } from 'react';

interface DreamDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DreamDatePicker({ value, onChange, onClose }: DreamDatePickerProps) {
  const [month, setMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const lastDay = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const days: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: lastDay }, (_, index) => index + 1),
  ];

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="꿈 기록 날짜 선택"
        className="w-full max-w-[340px] rounded-[24px] bg-n-900 p-5 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-b-200">
            {month.getFullYear()}년 {month.getMonth() + 1}월
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => changeMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-b-200 hover:bg-n-800"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => changeMonth(1)}
              disabled={
                month.getFullYear() === today.getFullYear() &&
                month.getMonth() === today.getMonth()
              }
              className="flex h-8 w-8 items-center justify-center rounded-full text-b-200 hover:bg-n-800 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="flex h-9 items-center justify-center text-[12px] font-medium text-b-400"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const isFuture = date > today;
            const isSelected =
              date.getFullYear() === value.getFullYear() &&
              date.getMonth() === value.getMonth() &&
              date.getDate() === value.getDate();

            return (
              <button
                key={day}
                type="button"
                disabled={isFuture}
                aria-pressed={isSelected}
                onClick={() => {
                  onChange(date);
                  onClose();
                }}
                className={[
                  'mx-auto flex h-9 w-9 items-center justify-center rounded-full',
                  'text-[14px] font-medium transition-colors',
                  isSelected
                    ? 'bg-p-100 text-p-900'
                    : 'text-b-200 hover:bg-n-800',
                  isFuture ? 'cursor-not-allowed opacity-25' : '',
                ].join(' ')}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-11 w-full rounded-[14px] bg-n-800 text-[14px] font-medium text-b-200"
        >
          닫기
        </button>
      </section>
    </div>
  );
}

export default DreamDatePicker;
