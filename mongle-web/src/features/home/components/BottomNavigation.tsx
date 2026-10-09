import { useState } from 'react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';

import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import ArchiveIcon from '@/components/icons/ArchiveIcon';
import CalendarIcon from '@/components/icons/CalendarIcon';
import HomeIcon from '@/components/icons/HomeIcon';

type NavTab = 'archive' | 'home' | 'calendar';

interface NavItem {
  tab: NavTab;
  label: string;
  path: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// TODO: 보관함 / 캘린더 페이지가 개발되면 path만 실제 경로로 변경 (예: '/archive', '/calendar')
// 현재는 모든 탭이 같은 경로('/')입니다
const NAV_ITEMS: NavItem[] = [
  { tab: 'archive', label: '꿈 보관함', path: '/', Icon: ArchiveIcon },
  { tab: 'home', label: '홈', path: '/', Icon: HomeIcon },
  { tab: 'calendar', label: '캘린더', path: '/', Icon: CalendarIcon },
];

// Figma Glass 효과(빛 -45° · 세기 80% · 흐릿함 5)를 CSS로 근사
// 빛이 왼쪽 위에서 들어와 왼쪽 위 / 오른쪽 아래 테두리가 밝게 반사되는 형태
// 테두리가 바라보는 방향에 따라 밝기가 달라지도록 conic-gradient(중심 기준 각도) 사용
// 굴절 · 깊이 · 분산 효과는 CSS로 구현 불가하여 제외
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

function BottomNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [selectedTab, setSelectedTab] = useState<NavTab>('home');

  // 현재 경로와 일치하는 탭이 하나뿐이면 경로 기준으로 선택 상태 표시
  // 지금은 모든 탭이 같은 경로('/')라서 마지막으로 클릭한 탭 기준으로 표시됨
  const matchedItems = NAV_ITEMS.filter((item) => item.path === pathname);
  const activeTab = matchedItems.length === 1 ? matchedItems[0].tab : selectedTab;

  const handleTabClick = ({ tab, path }: NavItem) => {
    setSelectedTab(tab);

    if (path !== pathname) {
      navigate(path);
    }
  };

  return (
    <nav aria-label="하단 메뉴" className="pointer-events-none fixed right-0 bottom-5 left-0 z-40">
      <div className="mx-auto flex w-full max-w-[480px] justify-center">
        <div className="pointer-events-auto relative flex items-center gap-2 rounded-full bg-white/10 p-1.5 shadow-[0_0_20px_0_rgba(255,255,255,0.25)] backdrop-blur-[5px]">
          {/* Glass 테두리 */}
          <span
            aria-hidden="true"
            style={GLASS_BORDER_STYLE}
            className="pointer-events-none absolute inset-0 rounded-full p-[1.2px]"
          />

          {NAV_ITEMS.map((item) => {
            const { tab, label, Icon } = item;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                aria-label={label}
                aria-pressed={isActive}
                onClick={() => handleTabClick(item)}
                className="relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full"
              >
                {/* 같은 layoutId를 가진 요소가 다른 탭에 그려지면 Framer Motion이 위치 이동을 애니메이션함 */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-navigation-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full border-[1.2px] border-white/40 bg-linear-[133deg] from-n-300 from-[14.95%] to-p-100 to-[86.96%]"
                  />
                )}

                <Icon
                  className={[
                    'relative h-[30px] w-[30px] transition-colors duration-200',
                    isActive ? 'text-p-900' : 'text-p-100',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNavigation;
