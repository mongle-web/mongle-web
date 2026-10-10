import trashIcon from '@/assets/icons/calendar/trash.svg';
import DreamImage from '@/components/common/DreamImage';
import type { CalendarDream } from '@/features/calendar/types/calendar';
import { formatDreamDate } from '@/features/calendar/utils/calendar';

interface DreamSummaryCardProps {
  dream: CalendarDream;
  onDelete?: (dream: CalendarDream) => void;
}

// 캘린더에서 날짜를 눌렀을 때 아래에 펼쳐지는 꿈 기록 카드
// 이미지가 있으면 대표 이미지 + 정보, 없으면 정보만 표시
// TODO: 꿈 상세 페이지(feat/dream-detail)가 생기면 카드 클릭 시 상세로 이동
function DreamSummaryCard({ dream, onDelete }: DreamSummaryCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-n-900 p-5">
      {dream.thumbnailUrl && (
        <DreamImage src={dream.thumbnailUrl} alt={dream.title} className="h-[158px] rounded-2xl" />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="h-[27px] truncate text-[16px] leading-[1.4] font-semibold text-b-200">
              {dream.title}
            </h3>
            <p className="text-[12px] leading-[1.5] text-b-400">{formatDreamDate(dream.date)}</p>
          </div>

          <button
            type="button"
            aria-label="꿈 삭제"
            onClick={() => onDelete?.(dream)}
            className="flex size-[18px] shrink-0 cursor-pointer items-center justify-center"
          >
            <img src={trashIcon} alt="" className="size-[18px]" />
          </button>
        </div>

        {dream.keywords.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {dream.keywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded-[8px] bg-n-800 px-2 py-1 text-[12px] leading-[1.5] text-b-400"
              >
                {keyword}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default DreamSummaryCard;
