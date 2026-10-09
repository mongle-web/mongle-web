interface RecordButtonProps {
  onClick: () => void;
}

// 꿈 기록하기 버튼 (화면 오른쪽 아래 고정)
// 하단 네비게이션과 항상 같이 노출되지 않아서 별도 컴포넌트로 분리
function RecordButton({ onClick }: RecordButtonProps) {
  return (
    <div className="pointer-events-none fixed right-0 bottom-5 left-0 z-40">
      <div className="mx-auto flex w-full max-w-[480px] justify-end px-5">
        <button
          type="button"
          onClick={onClick}
          aria-label="꿈 기록하기"
          className="pointer-events-auto flex h-[58px] cursor-pointer w-[58px] items-center justify-center rounded-full bg-[#E2DFFF] text-[#17121F] shadow-[0_0_24px_rgba(210,200,255,0.5)] transition active:scale-95"
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

export default RecordButton;
