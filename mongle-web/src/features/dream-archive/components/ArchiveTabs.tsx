import type { CSSProperties } from 'react';

import type { ArchiveTab } from '@/features/dream-archive/types/dreamArchive';

// 피그마 유리(Glass) 효과: 빛 -45° · 세기 80% · 흐릿함 23
// 하단 탭바(BottomNavigation)와 같은 방식으로 근사 (빛 각도 · 세기가 같아서 테두리 값도 동일)
// 흐릿함(뒤 배경 흐리게)은 탭 뒤가 단색 배경이라 차이가 없어서 제외
// 왼쪽 위 / 오른쪽 아래 테두리가 밝게 반사되도록 conic-gradient(중심 기준 각도) 사용
// 굴절 · 깊이 · 분산 효과 · Splay는 CSS로 구현 불가하여 제외
const GLASS_BORDER_STYLE: CSSProperties = {
  background: `conic-gradient(
    from -45deg,
    rgba(255, 255, 255, 0.8) 0deg,
    rgba(255, 255, 255, 0.1) 60deg,
    rgba(255, 255, 255, 0.1) 120deg,
    rgba(255, 255, 255, 0.8) 180deg,
    rgba(255, 255, 255, 0.1) 240deg,
    rgba(255, 255, 255, 0.1) 300deg,
    rgba(255, 255, 255, 0.8) 360deg
  )`,
  // 안쪽(content-box)을 뚫어서 padding 영역(= 테두리)만 남김
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
};

// 피그마: 선택된 탭 외곽선 (안쪽 1px, 흰색 40% → 10% 선형 그라데이션)
// 그라데이션 방향 · 위치는 피그마 핸들 위치를 측정한 값 (피그마가 수치로 내보내지 않음)
const SELECTED_STROKE_STYLE: CSSProperties = {
  background:
    'linear-gradient(98deg, rgba(255, 255, 255, 0.4) -28%, rgba(255, 255, 255, 0.1) 121%)',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
};

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
// 피그마: 바깥 흰색 10% + 유리 효과 · 안쪽 여백 8 · 탭 사이 8, 탭 높이 32
// 선택된 탭: 흰색 그라데이션 외곽선 + 보라 그라데이션, 글자 N-900 / 선택 안 된 탭: 글자 B-400
function ArchiveTabs({ selectedTab, onChange }: ArchiveTabsProps) {
  return (
    <div
      role="tablist"
      className="relative flex w-full items-center gap-2 rounded-full bg-white/10 p-2"
    >
      {/* 유리 테두리 (하단 탭바와 같은 두께 1.2px) */}
      <span
        aria-hidden="true"
        style={GLASS_BORDER_STYLE}
        className="pointer-events-none absolute inset-0 rounded-full p-[1.2px]"
      />

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
              // 피그마: 선택된 탭은 외곽선 두께(1px × 2)만큼 2px 더 넓음 (165.5 / 163.5)
              // → 투명 테두리로 자리를 잡고, 그 위에 그라데이션 외곽선을 덧그림
              // global.css의 button { border: 0 } 보다 우선하도록 테두리에도 ! 사용
              isSelected
                ? 'relative border! border-transparent! bg-origin-border text-n-900'
                : 'text-b-400',
            ].join(' ')}
          >
            {isSelected && (
              <span
                aria-hidden="true"
                style={SELECTED_STROKE_STYLE}
                className="pointer-events-none absolute -inset-px rounded-full p-px"
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default ArchiveTabs;
