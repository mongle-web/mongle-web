import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import chevronIcon from '@/assets/icons/calendar/chevron.svg';
import AddDreamButton from '@/features/calendar/components/AddDreamButton';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import CalendarHero from '@/features/calendar/components/CalendarHero';
import DreamSummaryCard from '@/features/calendar/components/DreamSummaryCard';
import MonthNavigator from '@/features/calendar/components/MonthNavigator';
import { useMonthlyDreams } from '@/features/calendar/hooks/useMonthlyDreams';
import type { CalendarDay } from '@/features/calendar/types/calendar';
import { getCalendarDays, isSameMonth, toDateKey } from '@/features/calendar/utils/calendar';
import BottomNavigation from '@/features/home/components/BottomNavigation';

function CalendarPage() {
  const navigate = useNavigate();

  // 표시 중인 달 (항상 1일로 저장)
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // 선택한 날짜 ('YYYY-MM-DD'), 선택 안 했으면 null
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const {
    data: dreams = [],
    isFetching,
    isError,
    refetch,
  } = useMonthlyDreams(month.getFullYear(), month.getMonth() + 1);

  const days = getCalendarDays(month, dreams);
  const dreamDayCount = days.filter((day) => day.dream).length;
  const monthLabel = isSameMonth(month, new Date()) ? '이번 달' : `${month.getMonth() + 1}월`;

  const selectedDay = days.find((day) => day.dateKey === selectedDateKey);
  const selectedDream = selectedDay?.dream;

  // 기록 있는 날을 선택하면 캘린더를 그 주 한 줄로 접고 카드를 보여준다
  const isCollapsed = Boolean(selectedDream);

  // 기록 없는 날을 선택하면 "꿈 추가하기" 버튼 표시 (미래 날짜는 기록할 수 없어서 제외)
  const todayKey = toDateKey(new Date());
  const canAddDream = Boolean(selectedDay && !selectedDream && selectedDay.dateKey <= todayKey);

  const changeMonth = (offset: number) => {
    setSelectedDateKey(null);
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const handleDayClick = (day: CalendarDay) => {
    // 이미 선택한 빈 날짜를 다시 누르면 선택 해제
    if (!day.dream && day.dateKey === selectedDateKey) {
      setSelectedDateKey(null);
      return;
    }

    setSelectedDateKey(day.dateKey);
  };

  const handleAddDream = () => {
    if (!selectedDateKey) return;

    // TODO: 꿈 기록 화면(DreamRecordPage)에서 ?date= 값을 읽어 기록 날짜로 쓰도록 담당자와 협의
    navigate(`/dreams/new?date=${selectedDateKey}`);
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
          <div className="flex h-[25px] items-start justify-between">
            <MonthNavigator
              month={month}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
            />

            {canAddDream && <AddDreamButton onClick={handleAddDream} />}
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
              <CalendarGrid
                days={days}
                selectedDateKey={selectedDateKey}
                isCollapsed={isCollapsed}
                onDayClick={handleDayClick}
              />
            </div>
          )}
        </section>

        {isCollapsed && (
          <>
            {/* 캘린더 펼치기 */}
            <button
              type="button"
              aria-label="캘린더 펼치기"
              onClick={() => setSelectedDateKey(null)}
              className="mx-auto mt-2 flex size-6 cursor-pointer items-center justify-center"
            >
              <img src={chevronIcon} alt="" className="size-6" />
            </button>

            <AnimatePresence mode="wait">
              {selectedDream && (
                <motion.div
                  key={selectedDream.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3"
                >
                  {/* TODO: 3단계에서 삭제 확인 모달 연결 */}
                  <DreamSummaryCard dream={selectedDream} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <BottomNavigation />
    </>
  );
}

export default CalendarPage;
