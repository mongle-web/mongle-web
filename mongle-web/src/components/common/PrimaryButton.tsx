import type { ButtonHTMLAttributes } from 'react';

// 화면 아래 큰 보라색 버튼 (피그마: 높이 56, 모서리 16, P-500, 흰색 40% 테두리 2px)
// 예: "다음", "그림으로 남기기", "홈으로 돌아가기", "선택한 꿈 연결하기"
// 꿈 기록(DreamRecordPage)에서 쓰던 것을 꿈 연결 등에서도 쓰도록 공통으로 분리
function PrimaryButton({
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      className={[
        'flex min-h-14 w-full items-center justify-center gap-2.5',
        'rounded-2xl border-2! border-solid! border-white/40!',
        'bg-p-500 px-3 py-2.5 text-[16px]! leading-[1.3]! font-semibold! text-b-200',
        'shadow-[0_0_8px_rgba(255,255,255,0.25)]',
        'transition-colors active:bg-p-900',
        'disabled:cursor-default disabled:bg-n-200 disabled:shadow-none',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-p-300',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
