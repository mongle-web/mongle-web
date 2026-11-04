import { useNavigate } from 'react-router-dom';

import mongleLogo from '@/assets/images/home/MongleLogo.svg';
import { LOGIN_PATH, useAuth } from '@/hooks/useAuth';

const PROFILE_PATH = '/profile';
const TOKEN_CHARGE_PATH = '/token';

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleProfileClick = () => {
    navigate(PROFILE_PATH);
  };

  // 토큰 충전은 로그인이 필요해서 로그아웃 상태면 로그인 페이지로
  const handleTokenClick = () => {
    navigate(isLoggedIn ? TOKEN_CHARGE_PATH : LOGIN_PATH);
  };

  return (
    <header className="flex h-6 items-center justify-between">
      <img src={mongleLogo} alt="Mongle" className="h-[30px] w-[123px] select-none" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleTokenClick}
          aria-label="토큰 충전"
          className="size-5 cursor-pointer text-b-200"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
            <path
              d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10.707 6.465C10.5195 6.27753 10.2652 6.17221 10 6.17221C9.73484 6.17221 9.48053 6.27753 9.293 6.465L6.465 9.293C6.27753 9.48053 6.17221 9.73484 6.17221 10C6.17221 10.2652 6.27753 10.5195 6.465 10.707L9.293 13.535C9.48053 13.7225 9.73484 13.8278 10 13.8278C10.2652 13.8278 10.5195 13.7225 10.707 13.535L13.535 10.707C13.7225 10.5195 13.8278 10.2652 13.8278 10C13.8278 9.73484 13.7225 9.48053 13.535 9.293L10.707 6.465Z"
              fill="currentColor"
            />
          </svg>
        </button>

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
      </div>
    </header>
  );
}

export default Header;
