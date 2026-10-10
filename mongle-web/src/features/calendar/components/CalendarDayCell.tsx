import { useState } from 'react';

import type { CalendarDay } from '@/features/calendar/types/calendar';

interface CalendarDayCellProps {
  day: CalendarDay;
  isSelected?: boolean;
  onClick?: (day: CalendarDay) => void;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

// 날짜 칸 상태 (피그마 기능 명세 기준)
// - 이미지 생성한 날: 대표 이미지 + 어두운 숫자
// - 기록만 있는 날: 보라색(P-300) 배경
// - 기록 없는 날: 회색(N-900) 배경
// - 기록 없는 날을 선택: 연보라(P-100) 배경 + 안쪽 보라 그림자
// - 앞/뒤 달 날짜: 배경 없이 흐린 숫자, 클릭 불가
function CalendarDayCell({ day, isSelected = false, onClick }: CalendarDayCellProps) {
  const { date, isCurrentMonth, dream } = day;
  const [imageStatus, setImageStatus] = useState<ImageStatus>('loading');

  const dayNumber = date.getDate();

  if (!isCurrentMonth) {
    return (
      <div className="flex h-14 min-w-0 flex-1 items-center justify-center text-[14px] leading-[1.5] font-semibold text-[#575669]">
        {dayNumber}
      </div>
    );
  }

  // 이미지 주소가 있어도 로딩에 실패하면 기록만 있는 날처럼 보여줌
  const hasImage = Boolean(dream?.thumbnailUrl) && imageStatus !== 'error';

  // 선택 강조(연보라 + 안쪽 그림자)는 "기록 없는 날"을 눌렀을 때만 사용
  // 기록이 있는 날은 선택해도 원래 모습(이미지 / 보라색)을 유지한다
  const isEmptySelected = isSelected && !dream;

  const backgroundClassName = (() => {
    if (isEmptySelected) return 'bg-p-100';
    if (hasImage) return imageStatus === 'loaded' ? 'bg-n-900' : 'animate-pulse bg-n-800';
    if (dream) return 'bg-p-300';
    return 'bg-n-900';
  })();

  const textClassName = dream || isEmptySelected ? 'text-b-900' : 'text-b-200';

  return (
    <button
      type="button"
      aria-label={`${date.getMonth() + 1}월 ${dayNumber}일${dream ? `, ${dream.title}` : ''}`}
      aria-pressed={isSelected}
      onClick={() => onClick?.(day)}
      className={[
        'relative flex h-14 min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg',
        'text-[14px] leading-[1.5] font-semibold transition-colors',
        backgroundClassName,
        textClassName,
      ].join(' ')}
    >
      {hasImage && (
        <img
          src={dream?.thumbnailUrl}
          alt=""
          loading="lazy"
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
          className={[
            'pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-300',
            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}

      <span className="relative">{dayNumber}</span>

      {isEmptySelected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_16px_0_#7a6ce3]"
        />
      )}
    </button>
  );
}

export default CalendarDayCell;
