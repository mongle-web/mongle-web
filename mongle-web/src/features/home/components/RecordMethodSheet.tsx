import { useState } from 'react';

import mikeImage from '@/assets/images/home/mike.png';
import textReportImage from '@/assets/images/home/text_report.png';

interface RecordMethodSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function RecordMethodSheet({ isOpen, onClose }: RecordMethodSheetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 23));

  if (!isOpen) {
    return null;
  }

  const handlePreviousDate = () => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 1);
      return nextDate;
    });
  };

  const handleNextDate = () => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate;
    });
  };

  const formatDate = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="기록 방식 선택 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      <section className="relative z-10 w-full max-w-[480px] rounded-t-[28px] bg-[#1D1A25] px-4 pt-3 pb-5 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]">
        <div className="mx-auto mb-4 h-[5px] w-7 rounded-full bg-[#68636F]" />

        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePreviousDate}
            aria-label="이전 날짜"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#F7F5FA] transition active:bg-white/5"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <p className="min-w-[128px] text-center text-[14px] font-semibold text-[#F7F5FA]">
            {formatDate(selectedDate)}
          </p>

          <button
            type="button"
            onClick={handleNextDate}
            aria-label="다음 날짜"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#F7F5FA] transition active:bg-white/5"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="relative h-[116px] overflow-hidden rounded-[20px] bg-[#292633] px-4 py-4 text-left transition duration-150 active:scale-[0.98]"
          >
            <div className="relative z-10 max-w-[72px]">
              <span className="block text-[12px] leading-[1.4] font-medium text-[#F7F5FA]">
                음성으로
                <br />
                기록하기
              </span>
            </div>

            <img
              src={mikeImage}
              alt=""
              className="absolute right-2 bottom-1 h-[70px] w-[78px] object-contain"
            />
          </button>

          <button
            type="button"
            className="relative h-[116px] overflow-hidden rounded-[20px] bg-[#292633] px-4 py-4 text-left transition duration-150 active:scale-[0.98]"
          >
            <div className="relative z-10 max-w-[72px]">
              <span className="block text-[12px] leading-[1.4] font-medium text-[#F7F5FA]">
                텍스트로
                <br />
                기록하기
              </span>
            </div>

            <img
              src={textReportImage}
              alt=""
              className="absolute right-2 bottom-1 h-[72px] w-[72px] object-contain"
            />
          </button>
        </div>

        <div className="mx-auto mt-6 h-[4px] w-[108px] rounded-full bg-[#EEEAF5]" />
      </section>
    </div>
  );
}

export default RecordMethodSheet;