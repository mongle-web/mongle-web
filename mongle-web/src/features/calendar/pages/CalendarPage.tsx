import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import chevronIcon from '@/assets/icons/calendar/chevron.svg';
import profileIcon from '@/assets/icons/common/profile.svg';
import AddDreamButton from '@/features/calendar/components/AddDreamButton';
import CalendarDialog from '@/features/calendar/components/CalendarDialog';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import CalendarHero from '@/features/calendar/components/CalendarHero';
import DreamSummaryCard from '@/features/calendar/components/DreamSummaryCard';
import MonthNavigator from '@/features/calendar/components/MonthNavigator';
import YearMonthPickerDialog from '@/features/calendar/components/YearMonthPickerDialog';
import { useDeleteDream } from '@/features/calendar/hooks/useDeleteDream';
import { useMonthlyDreams } from '@/features/calendar/hooks/useMonthlyDreams';
import type { CalendarDay, CalendarDream } from '@/features/calendar/types/calendar';
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

  // 열려 있는 창: 날짜 선택 창 여부 / 삭제하려는 꿈
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState<CalendarDream | null>(null);

  const deleteDreamMutation = useDeleteDream();

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

  const handlePickMonth = (nextMonth: Date) => {
    setSelectedDateKey(null);
    setMonth(nextMonth);
    setIsPickerOpen(false);
  };

  const closeDeleteDialog = () => {
    deleteDreamMutation.reset(); // 이전 실패 메시지 지우기
    setDreamToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!dreamToDelete) return;

    deleteDreamMutation.mutate(dreamToDelete.id, {
      onSuccess: () => {
        // 삭제한 꿈 카드를 닫고 캘린더를 다시 펼친다
        setSelectedDateKey(null);
        setDreamToDelete(null);
      },
    });
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
      <div className="min-h-screen overflow-x-clip bg-b-900 px-5 pt-[14px] pb-28">
        {/* 헤더 (피그마: 로고 · 프로필 아이콘 높이 24, 아래 문구까지 33px) */}
        <header className="mb-[33px] flex h-6 items-center justify-between">
          <span className="text-[20px] leading-6 text-b-200">logo</span>

          {/* TODO: 마이페이지가 생기면 이동 연결 */}
          <button type="button" aria-label="프로필" className="size-6 cursor-pointer">
            <img src={profileIcon} alt="" className="size-6" />
          </button>
        </header>

        <CalendarHero monthLabel={monthLabel} dreamDayCount={dreamDayCount} />

        <section aria-label="꿈 캘린더" className="flex flex-col gap-5">
          <div className="flex h-[25px] items-start justify-between">
            <MonthNavigator
              month={month}
              onPrev={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
              onTitleClick={() => setIsPickerOpen(true)}
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
                  <DreamSummaryCard dream={selectedDream} onDelete={setDreamToDelete} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <BottomNavigation />

      <AnimatePresence>
        {isPickerOpen && (
          <YearMonthPickerDialog
            key="year-month-picker"
            initialMonth={month}
            onCancel={() => setIsPickerOpen(false)}
            onConfirm={handlePickMonth}
          />
        )}

        {dreamToDelete && (
          <CalendarDialog
            key="delete-dream"
            title="정말 꿈을 삭제할까요?"
            confirmLabel={deleteDreamMutation.isPending ? '삭제 중...' : '삭제'}
            isConfirmDisabled={deleteDreamMutation.isPending}
            onCancel={closeDeleteDialog}
            onConfirm={handleDeleteConfirm}
          >
            <p className="w-full text-[14px] leading-[1.5] font-medium text-b-400">
              {deleteDreamMutation.isError
                ? '삭제하지 못했어요. 다시 시도해 주세요.'
                : '삭제하면 다시 되돌릴 수 없어요.'}
            </p>
          </CalendarDialog>
        )}
      </AnimatePresence>
    </>
  );
}

export default CalendarPage;
