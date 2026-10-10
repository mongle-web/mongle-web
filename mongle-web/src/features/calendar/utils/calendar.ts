import type { CalendarDay, CalendarDream } from '@/features/calendar/types/calendar';

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// Date → 'YYYY-MM-DD'
export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// 'YYYY-MM-DD' → Date (시간대 문제를 피하려고 직접 나눠서 생성)
export const fromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
};

// 2026. 09
export const formatYearMonth = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${date.getFullYear()}. ${month}`;
};

// 9월 16일 (수)
export const formatDreamDate = (dateKey: string) => {
  const date = fromDateKey(dateKey);

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
};

// 표시할 달의 날짜 목록을 일요일 시작 기준으로 만든다.
// 첫 주 앞부분은 이전 달 날짜, 마지막 주 뒷부분은 다음 달 날짜로 채운다.
export const getCalendarDays = (month: Date, dreams: CalendarDream[]): CalendarDay[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + lastDate) / 7) * 7;

  const dreamByDate = new Map(dreams.map((dream) => [dream.date, dream]));

  return Array.from({ length: totalCells }, (_, index) => {
    // new Date(2026, 8, 0)처럼 범위를 벗어난 날짜는 자동으로 이전/다음 달로 계산된다
    const date = new Date(year, monthIndex, index - firstWeekday + 1);
    const dateKey = toDateKey(date);
    const isCurrentMonth = date.getMonth() === monthIndex;

    return {
      date,
      dateKey,
      isCurrentMonth,
      dream: isCurrentMonth ? dreamByDate.get(dateKey) : undefined,
    };
  });
};

// [1, 2, ..., 35] → [[1..7], [8..14], ...]
export const splitIntoWeeks = <T>(items: T[]) => {
  const weeks: T[][] = [];

  for (let index = 0; index < items.length; index += 7) {
    weeks.push(items.slice(index, index + 7));
  }

  return weeks;
};

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
