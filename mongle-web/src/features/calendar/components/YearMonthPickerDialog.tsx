import { useState } from 'react';

import CalendarDialog from '@/features/calendar/components/CalendarDialog';
import WheelColumn from '@/features/calendar/components/WheelColumn';

interface YearMonthPickerDialogProps {
  initialMonth: Date; // 현재 캘린더에 표시 중인 달
  onCancel: () => void;
  onConfirm: (month: Date) => void;
}

// 서비스 시작 연도 ~ 올해까지 선택 가능 (피그마 예시: 2025년, 2026년)
const START_YEAR = 2025;

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - START_YEAR + 1 },
  (_, index) => {
    const year = START_YEAR + index;
    return { value: year, label: `${year}년` };
  },
);

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}월`,
}));

// 연월(밑줄)을 눌렀을 때 열리는 "날짜 선택" 창
function YearMonthPickerDialog({ initialMonth, onCancel, onConfirm }: YearMonthPickerDialogProps) {
  const [year, setYear] = useState(initialMonth.getFullYear());
  const [month, setMonth] = useState(initialMonth.getMonth() + 1);

  return (
    <CalendarDialog
      title="날짜 선택"
      confirmLabel="확인"
      actionsClassName="mt-5"
      onCancel={onCancel}
      onConfirm={() => onConfirm(new Date(year, month - 1, 1))}
    >
      {/* 피그마: 제목과 휠 사이 40px (제목 아래 gap 10px + 여기 30px) */}
      <div className="mt-[30px] flex gap-3">
        <WheelColumn label="연도" options={YEAR_OPTIONS} value={year} onChange={setYear} />
        <WheelColumn label="월" options={MONTH_OPTIONS} value={month} onChange={setMonth} />
      </div>
    </CalendarDialog>
  );
}

export default YearMonthPickerDialog;
