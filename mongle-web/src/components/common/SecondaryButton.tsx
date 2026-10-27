import type { ButtonHTMLAttributes } from 'react';

// 큰 버튼 아래의 글자 버튼 (피그마: 높이 40, 16 SemiBold B-400)
// 예: "이전", "다음에 만들어볼게요", "이미지 다시 생성하기"
// 꿈 기록(DreamRecordPage)에서 쓰던 것을 꿈 연결 등에서도 쓰도록 공통으로 분리
function SecondaryButton({
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      className={[
        'flex min-h-10 w-full items-center justify-center gap-2.5',
        'rounded-2xl bg-transparent px-3 py-2',
        'text-[16px]! leading-[1.3]! font-semibold! text-b-400',
        'disabled:opacity-40',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-p-300',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
