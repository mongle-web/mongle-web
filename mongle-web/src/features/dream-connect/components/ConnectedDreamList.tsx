import plusIcon from '@/assets/icons/dream-connect/plus.svg';
import { formatDreamDate } from '@/features/calendar/utils/calendar';
import type { ConnectableDream } from '@/features/dream-connect/types/dreamConnect';

interface ConnectedDreamListProps {
  dreams: ConnectableDream[];
  onAdd: () => void;
}

// 연결된 꿈 목록 + 꿈 추가(+) 버튼
// 피그마: 제목 18 Medium B-200, 제목과 목록 사이 16, 카드 사이 8
// 카드: 배경 N-800, 모서리 16, 여백 가로 20 · 세로 16, 제목 16 SemiBold(높이 27) · 날짜 12 B-400
// + 버튼: 배경 N-200, 높이 56, 아이콘 24
function ConnectedDreamList({ dreams, onAdd }: ConnectedDreamListProps) {
  return (
    <section className="flex w-full flex-col gap-4">
      <h3 className="text-[18px] leading-[1.5] font-medium text-b-200">연결된 꿈</h3>

      <ul className="flex flex-col gap-2">
        {dreams.map((dream) => (
          <li key={dream.dreamId} className="flex flex-col rounded-2xl bg-n-800 px-5 py-4">
            <span className="h-[27px] w-[199px] truncate text-[16px] leading-[1.4] font-semibold text-b-200">
              {dream.title}
            </span>
            <span className="text-[12px] leading-[1.5] text-b-400">
              {formatDreamDate(dream.dreamedAt)}
            </span>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={onAdd}
            aria-label="연결할 꿈 추가"
            className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-n-200 px-5 py-4"
          >
            <img src={plusIcon} alt="" className="size-6" />
          </button>
        </li>
      </ul>
    </section>
  );
}

export default ConnectedDreamList;
