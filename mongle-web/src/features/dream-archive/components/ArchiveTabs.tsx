import type { ArchiveTab } from '@/features/dream-archive/types/dreamArchive';

// 피그마: 선택된 탭 배경 그라데이션 (탭마다 각도가 다름)
const TABS: { tab: ArchiveTab; label: string; gradient: string }[] = [
  {
    tab: 'recorded',
    label: '기록한 꿈',
    gradient: 'linear-gradient(155.89deg, rgb(190, 187, 219) 14.946%, rgb(231, 228, 255) 86.957%)',
  },
  {
    tab: 'connected',
    label: '연결된 꿈',
    gradient: 'linear-gradient(168.09deg, rgb(190, 187, 219) 14.946%, rgb(231, 228, 255) 86.957%)',
  },
];

interface ArchiveTabsProps {
  selectedTab: ArchiveTab;
  onChange: (tab: ArchiveTab) => void;
}

// 보관함 상단 탭 (기록한 꿈 / 연결된 꿈)
// 피그마: 바깥 흰색 10% · 안쪽 여백 8 · 탭 사이 8, 탭 높이 32
// 선택된 탭: 흰색 40% 테두리 + 그라데이션, 글자 N-900 / 선택 안 된 탭: 글자 B-400
function ArchiveTabs({ selectedTab, onChange }: ArchiveTabsProps) {
  return (
    <div role="tablist" className="flex w-full items-center gap-2 rounded-full bg-white/10 p-2">
      {TABS.map(({ tab, label, gradient }) => {
        const isSelected = tab === selectedTab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(tab)}
            style={isSelected ? { backgroundImage: gradient } : undefined}
            className={[
              // global.css의 button { font: inherit } 보다 우선하도록 글자 스타일에 ! 사용
              'flex h-8 min-w-px flex-[1_0_0] cursor-pointer items-center justify-center rounded-full px-3 py-1.5 text-center text-[14px]! leading-[1.3]! font-medium! whitespace-nowrap',
              // global.css의 button { border: 0 } 보다 우선하도록 테두리에도 ! 사용
              isSelected ? 'border! border-white/40! text-n-900' : 'text-b-400',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default ArchiveTabs;
