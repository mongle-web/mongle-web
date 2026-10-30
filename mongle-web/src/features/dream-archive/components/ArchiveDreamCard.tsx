import type { KeyboardEvent, MouseEvent } from 'react';

import trashIcon from '@/assets/icons/calendar/trash.svg';
import { formatDreamDate } from '@/features/calendar/utils/calendar';
import type { ArchiveDream } from '@/features/dream-archive/types/dreamArchive';

interface ArchiveDreamCardProps {
  dream: ArchiveDream;
  connectedDreams?: { firstTitle: string; count: number }; // "연결된 꿈" 카드일 때만 (첫 꿈 제목 · 연결한 꿈 수)
  onClick?: () => void;
  onDelete: () => void;
}

// 보관함 꿈 카드
// 피그마: 배경 N-900, 모서리 24, 여백 20, 제목 16 SemiBold(줄간격 1.3) · 날짜 12, 휴지통 18
// 키워드 태그 12 B-400, 배경 N-800, 모서리 8, 여백 가로 8 · 세로 4, 태그 사이 4
// "연결된 꿈" 카드: 제목 아래 8px에 "첫 꿈 제목 외 N개의 꿈을 연결했어요" (14)
function ArchiveDreamCard({ dream, connectedDreams, onClick, onDelete }: ArchiveDreamCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter') onClick?.();
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // 카드 클릭(상세 이동)으로 번지지 않게
    onDelete();
  };

  return (
    <article
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={[
        'flex w-full flex-col gap-3 rounded-3xl bg-n-900 p-5',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex w-[199px] flex-col">
            <h3 className="text-[16px] leading-[1.3] font-semibold break-keep text-b-200">
              {dream.title}
            </h3>
            <p className="text-[12px] leading-[1.5] text-b-400">{formatDreamDate(dream.date)}</p>
          </div>

          <button
            type="button"
            aria-label="꿈 삭제"
            onClick={handleDelete}
            className="flex size-[18px] shrink-0 cursor-pointer items-center justify-center"
          >
            <img src={trashIcon} alt="" className="size-[18px]" />
          </button>
        </div>

        {connectedDreams && (
          <p className="text-[14px] leading-[1.5] font-medium break-keep text-b-400">
            <span className="font-semibold text-b-300">{connectedDreams.firstTitle}</span>
            {/* 원본 꿈을 지워 1개만 남으면 "외 0개" 대신 백엔드 권장 문구 */}
            {connectedDreams.count > 1
              ? ` 외 ${connectedDreams.count - 1}개의 꿈을 연결했어요`
              : '의 꿈이 남아 있어요'}
          </p>
        )}
      </div>

      {dream.keywords.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {dream.keywords.map((keyword) => (
            <li
              key={keyword}
              className="truncate rounded-[8px] bg-n-800 px-2 py-1 text-[12px] leading-[1.5] text-b-400"
            >
              {keyword}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default ArchiveDreamCard;
