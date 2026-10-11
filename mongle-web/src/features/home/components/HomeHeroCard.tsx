import { useState } from 'react';

import cloudP200 from '@/assets/images/home/cloud_p-200.png';
import cloudP500 from '@/assets/images/home/cloud_p-500.png';
import homeCharacter from '@/assets/images/home/home_character.png';
import ArrowIcon from '@/components/icons/ArrowIcon';
import { WEEKDAYS } from '@/features/calendar/utils/calendar';

// 예: 2026. 10. 02 (금)
const formatHeroDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}. ${month}. ${day} (${WEEKDAYS[date.getDay()]})`;
};

function HomeHeroCard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const moveDate = (offset: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + offset);
      return next;
    });
  };

  return (
    <div className="relative h-[232px] w-full overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(210,204,255,0.20)_0%,rgba(210,204,255,0.01)_100%)]">
      {/* 날짜 이동 (피그마: 위에서 20px, 가운데 정렬, 화살표 간격 16px) */}
      <div className="relative z-10 flex items-center justify-center gap-4 pt-5">
        <button
          type="button"
          onClick={() => moveDate(-1)}
          aria-label="이전 날짜"
          className="cursor-pointer text-b-400"
        >
          <ArrowIcon rotate={180} />
        </button>

        <p className="text-[16px] leading-[1.5] font-medium text-b-200">
          {formatHeroDate(selectedDate)}
        </p>

        <button
          type="button"
          onClick={() => moveDate(1)}
          aria-label="다음 날짜"
          className="cursor-pointer text-b-400"
        >
          <ArrowIcon />
        </button>
      </div>

      <img
        src={cloudP500}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 h-[205px] w-full select-none"
      />
      <img
        src={cloudP200}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 h-[158.5px] w-full select-none"
      />

      <img
        src={homeCharacter}
        alt=""
        className="absolute top-[50px] right-[-10px] w-[190px] select-none"
      />
    </div>
  );
}

export default HomeHeroCard;
