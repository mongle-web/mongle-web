interface StatusMessageProps {
  message: string;
  onRetry?: () => void;
}

// 찾을 수 없음 / 불러오기 실패 안내 (상세 · 수정 화면 공통)
export function StatusMessage({ message, onRetry }: StatusMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-n-900 px-5 py-10 text-center">
      <p className="text-[14px] text-b-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-9 cursor-pointer rounded-full bg-p-100 px-4 text-[12px]! font-medium! text-b-800"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

// 불러오는 동안 화면 모양만 미리 보여주는 회색 상자 (상세 · 수정 화면 공통)
export function DreamDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="꿈 기록 불러오는 중" className="flex flex-col gap-4">
      <div className="h-[220px] animate-pulse rounded-3xl bg-n-800" />
      <div className="h-[211px] animate-pulse rounded-3xl bg-n-800" />
      <div className="h-[104px] animate-pulse rounded-3xl bg-n-800" />
    </div>
  );
}
