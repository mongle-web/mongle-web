interface BottomNavigationProps {
  onAddClick: () => void;
}

function BottomNavigation({ onAddClick }: BottomNavigationProps) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-5 left-0 z-40">
      <div className="mx-auto flex w-full max-w-[480px] items-end justify-center px-5">
        <div className="pointer-events-auto flex h-[58px] items-center gap-1 rounded-full border border-white/10 bg-[#24212E]/95 px-3 shadow-[0_12px_35px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <button
            type="button"
            aria-label="꿈 보관함"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#B2ACBD]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
              <path d="m4 7.5 8 4.5 8-4.5" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="홈"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D6D0FF] text-[#554A7F]"
          >
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
              <path d="M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="캘린더"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#B2ACBD]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          aria-label="꿈 기록하기"
          className="pointer-events-auto ml-8 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#E2DFFF] text-[#17121F] shadow-[0_0_24px_rgba(210,200,255,0.5)] transition active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default BottomNavigation;
