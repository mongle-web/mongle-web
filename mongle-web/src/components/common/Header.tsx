import { useNavigate } from 'react-router-dom';

import mongleLogo from '@/assets/images/home/MongleLogo.svg';

const PROFILE_PATH = '/profile';

// 로고 · 프로필 아이콘 공통 헤더 (피그마: 높이 24)
function Header() {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(PROFILE_PATH);
  };

  return (
    <header className="flex h-6 items-center justify-between">
      {/* 피그마: 로고 123 x 30 (헤더 높이 24 유지, 로고는 세로 가운데 정렬) */}
      <img src={mongleLogo} alt="Mongle" className="h-[30px] w-[123px] select-none" />

      <button
        type="button"
        onClick={handleProfileClick}
        aria-label="프로필"
        className="size-6 cursor-pointer text-p-100"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
          <path
            d="M3 18C3 15.7909 4.79086 14 7 14H17C19.2091 14 21 15.7909 21 18V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V18Z"
            fill="currentColor"
          />
          <circle cx="12" cy="7" r="5" fill="currentColor" />
        </svg>
      </button>
    </header>
  );
}

export default Header;
