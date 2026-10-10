import { useState } from 'react';

import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import CalendarHero from '@/features/calendar/components/CalendarHero';
import MonthNavigator from '@/features/calendar/components/MonthNavigator';
import { useMonthlyDreams } from '@/features/calendar/hooks/useMonthlyDreams';
import { getCalendarDays, isSameMonth } from '@/features/calendar/utils/calendar';
import BottomNavigation from '@/features/home/components/BottomNavigation';

function CalendarPage() {
  // 표시 중인 달 (항상 1일로 저장)
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const {
    data: dreams = [],
    isFetching,
    isError,
    refetch,
  } = useMonthlyDreams(month.getFullYear(), month.getMonth() + 1);

  const days = getCalendarDays(month, dreams);
  const dreamDayCount = days.filter((day) => day.dream).length;
  const monthLabel = isSameMonth(month, new Date()) ? '이번 달' : `${month.getMonth() + 1}월`;

  const changeMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <>
      {/* 캐릭터 빛 번짐이 화면 오른쪽 밖으로 나가도 가로 스크롤이 생기지 않게 overflow-x-clip */}
      <div className="min-h-screen overflow-x-clip bg-b-900 px-5 pt-5 pb-28">
        {/* 헤더 */}
        <header className="mb-6 flex items-center justify-between">
          <span className="text-[20px] text-b-200">logo</span>

          <button
            type="button"
            aria-label="프로필"
            className="flex h-9 w-9 items-center justify-center text-[#D3CEDD]"
          >
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20c0-4 3-7 7-7s7 3 7 7v1H5z" />
            </svg>
          </button>
        </header>
        <CalendarHero monthLabel={monthLabel} dreamDayCount={dreamDayCount} />
        <section aria-label="꿈 캘린더" className="flex flex-col gap-5">
          <div className="flex h-[25px] items-center justify-between">
            <MonthNavigator
              month={month}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
            />
          </div>

          {isError ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-n-900 px-5 py-10 text-center">
              <p className="text-[14px] text-b-300">꿈 기록을 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="h-9 cursor-pointer rounded-full bg-p-100 px-4 text-[12px] font-medium text-b-800"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div
              aria-busy={isFetching}
              className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}
            >
              <CalendarGrid days={days} />
            </div>
          )}
        </section>
      </div>

      <BottomNavigation />
    </>
  );
}

export default CalendarPage;
