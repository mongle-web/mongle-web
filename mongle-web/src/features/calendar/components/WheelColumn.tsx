import { useEffect, useRef } from 'react';

interface WheelOption {
  value: number;
  label: string;
}

interface WheelColumnProps {
  label: string; // 스크린리더용 이름 (예: '연도')
  options: WheelOption[];
  value: number;
  onChange: (value: number) => void;
}

// 피그마 기준: 한 칸 높이 40px(글자 24 + 위아래 여백), 3칸이 보이고 가운데 칸이 선택값
const ITEM_HEIGHT = 40;
const VISIBLE_HEIGHT = 104;
const EDGE_PADDING = (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2; // 32px: 첫/마지막 항목도 가운데에 올 수 있게

// 위아래로 스크롤해서 고르는 휠 선택기 한 줄
function WheelColumn({ label, options, value, onChange }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | undefined>(undefined);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  // 처음 열릴 때 선택값이 가운데 오도록 스크롤 위치 맞추기
  useEffect(() => {
    listRef.current?.scrollTo({ top: selectedIndex * ITEM_HEIGHT });
    // 처음 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => window.clearTimeout(scrollTimerRef.current), []);

  // 스크롤이 멈추면 가운데에 온 항목을 선택값으로
  const handleScroll = () => {
    window.clearTimeout(scrollTimerRef.current);

    scrollTimerRef.current = window.setTimeout(() => {
      const scrollTop = listRef.current?.scrollTop ?? 0;
      const index = Math.min(options.length - 1, Math.round(scrollTop / ITEM_HEIGHT));
      const nextValue = options[index]?.value;

      if (nextValue !== undefined && nextValue !== value) onChange(nextValue);
    }, 80);
  };

  const scrollToIndex = (index: number) => {
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
  };

  return (
    <div className="relative h-[104px] w-[90px]">
      {/* 선택 영역 위/아래 선 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-8 h-px bg-b-400"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[72px] h-px bg-b-400"
      />

      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        onScroll={handleScroll}
        style={{ paddingBlock: EDGE_PADDING }}
        className="h-full snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => scrollToIndex(index)}
              className={[
                'flex h-10 w-full cursor-pointer snap-center items-center justify-center',
                'text-[16px] leading-[1.5] font-medium transition-colors',
                isSelected ? 'text-b-200' : 'text-b-400',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WheelColumn;
