import checkOffIcon from '@/assets/icons/dream-connect/check-off.svg';
import checkOnIcon from '@/assets/icons/dream-connect/check-on.svg';
import { formatDreamDate } from '@/features/calendar/utils/calendar';
import type { ConnectableDream } from '@/features/dream-connect/types/dreamConnect';

interface ConnectDreamCardProps {
  dream: ConnectableDream;
  isSelected: boolean;
  onToggle: () => void;
}

// 꿈 연결하기 - 꿈 선택 카드
// 피그마: 모서리 16, 여백 가로 20 · 세로 16, 체크 아이콘 24, 아이콘과 글자 사이 16
// 선택 안 됨: 배경 N-900 · 회색 체크 / 선택됨: 배경 N-800 · 보라 체크
// 제목 16 SemiBold(줄간격 1.4, 높이 27) · 날짜 12 B-400
function ConnectDreamCard({ dream, isSelected, onToggle }: ConnectDreamCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      onClick={onToggle}
      className={[
        'flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 text-left',
        isSelected ? 'bg-n-800' : 'bg-n-900',
      ].join(' ')}
    >
      <img src={isSelected ? checkOnIcon : checkOffIcon} alt="" className="size-6 shrink-0" />

      <span className="flex w-[199px] flex-col">
        {/* global.css의 button { font: inherit } 보다 우선하도록 글자 스타일에 ! 사용 */}
        <span className="h-[27px] truncate text-[16px]! leading-[1.4]! font-semibold! text-b-200">
          {dream.title}
        </span>
        <span className="text-[12px]! leading-[1.5]! text-b-400">
          {formatDreamDate(dream.dreamedAt)}
        </span>
      </span>
    </button>
  );
}

export default ConnectDreamCard;
