import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackHeaderProps {
  title: string;
  rightSlot?: ReactNode;
  onBack?: () => void; // 뒤로 가기 대신 할 동작 (없으면 이전 화면으로)
}

function BackHeader({ title, rightSlot, onBack }: BackHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <header className="flex items-center justify-between self-stretch px-5 py-2">
      <button
        type="button"
        onClick={handleBack}
        aria-label="이전 화면"
        className="size-7 cursor-pointer text-b-200"
      >
        <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" className="size-7">
          <path
            d="M15.1665 7L8.1665 14L15.1665 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 className="text-center text-[16px] leading-[1.5] font-medium text-b-200">{title}</h1>

      {rightSlot ?? <div aria-hidden="true" className="size-7" />}
    </header>
  );
}

export default BackHeader;
