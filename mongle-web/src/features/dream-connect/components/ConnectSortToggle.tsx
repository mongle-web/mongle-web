import sortIcon from '@/assets/icons/dream-connect/sort.svg';
import type { ConnectSort } from '@/features/dream-connect/types/dreamConnect';

const SORT_LABEL: Record<ConnectSort, string> = {
  LATEST: '최신순',
  OLDEST: '오래된순',
};

interface ConnectSortToggleProps {
  sort: ConnectSort;
  onChange: (sort: ConnectSort) => void;
}

// 최신순 ↔ 오래된순 전환 버튼
// 피그마: 12 Regular B-200, 아이콘 14 (90° 회전), 글자와 아이콘 사이 8
function ConnectSortToggle({ sort, onChange }: ConnectSortToggleProps) {
  const handleClick = () => {
    onChange(sort === 'LATEST' ? 'OLDEST' : 'LATEST');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`정렬: ${SORT_LABEL[sort]} (눌러서 바꾸기)`}
      className="flex cursor-pointer items-center justify-center gap-2"
    >
      {/* global.css의 button { font: inherit } 보다 우선하도록 글자 스타일에 ! 사용 */}
      <span className="text-center text-[12px]! leading-[1.5]! text-b-200">{SORT_LABEL[sort]}</span>
      <img src={sortIcon} alt="" className="size-[14px] rotate-90" />
    </button>
  );
}

export default ConnectSortToggle;
