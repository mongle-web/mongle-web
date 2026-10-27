import { useNavigate } from 'react-router-dom';

import { authStorage } from '@/api/authStorage';
import { BackHeader } from '@/components/common';
import { LOGIN_PATH, useAuth } from '@/hooks/useAuth';

// TODO: 닉네임 API 연동 시 제거
const TEMP_NICKNAME = '이름이름';

// 마이페이지 (로그인 상태에 따라 로그아웃 버튼 / 로그인 버튼)
function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleLogin = () => {
    navigate(LOGIN_PATH);
  };

  // TODO: 로그아웃 API가 생기면 호출 후 처리
  const handleLogout = () => {
    authStorage.clear();
    navigate('/');
  };

  return (
    <div className="relative min-h-dvh bg-b-900">
      <BackHeader title="마이페이지" />

      <section className="mx-auto mt-[106px] flex w-fit flex-col items-center gap-5">
        <div className="relative size-[90px]">
          <svg viewBox="0 0 90 90" fill="none" aria-hidden="true" className="size-[90px]">
            <circle cx="45" cy="45" r="45" fill="#413E58" />
            <path
              d="M45.563 51.75C60.8758 51.7502 73.6338 62.6774 76.4712 77.1592C68.3567 85.1012 57.2517 89.9999 45.0005 90C33.2253 90 22.5079 85.4753 14.4878 78.0723C16.9575 63.1389 29.9296 51.75 45.563 51.75ZM45.563 15.75C54.2612 15.7503 61.313 22.8017 61.313 31.5C61.313 40.1983 54.2612 47.2497 45.563 47.25C36.8645 47.25 29.813 40.1985 29.813 31.5C29.813 22.8015 36.8645 15.75 45.563 15.75Z"
              fill="#292834"
            />
          </svg>

          {/* TODO: 누르면 편집 동작되게 */}
          {isLoggedIn && (
            <button
              type="button"
              aria-label="프로필 편집"
              className="absolute right-[-4px] bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-n-300"
            >
              <svg viewBox="0 0 23 23" fill="none" aria-hidden="true" className="size-[22.375px]">
                <path
                  d="M14.1157 4.70071L12.7908 6.02549L16.3494 9.58377L17.6742 8.25899C18.3586 7.57471 18.3586 6.46617 17.6742 5.78188L16.5957 4.70071C15.9114 4.01643 14.8028 4.01643 14.1184 4.70071H14.1157ZM12.1722 6.64408L5.7914 13.0271C5.50671 13.3118 5.29868 13.6648 5.18371 14.0508L4.21468 17.3436C4.14625 17.5762 4.20921 17.8253 4.37892 17.995C4.54864 18.1647 4.79774 18.2277 5.02768 18.162L8.32071 17.193C8.70668 17.0781 9.0598 16.87 9.34448 16.5854L15.7307 10.2024L12.1722 6.64408Z"
                  fill="#413E58"
                />
              </svg>
            </button>
          )}
        </div>

        {isLoggedIn ? (
          // TODO: 닉네임 API 연동 (현재 임시 값)
          <p className="w-[145px] rounded-[16px] bg-n-900 px-5 py-3 text-center text-[14px] leading-[1.5] font-medium text-b-200">
            {TEMP_NICKNAME}
          </p>
        ) : (
          <p className="text-[14px] leading-[1.5] font-medium text-b-400">
            로그인 후 이용할 수 있어요.
          </p>
        )}
      </section>

      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          className="absolute inset-x-5 bottom-[42px] flex h-14 cursor-pointer items-center justify-center rounded-[16px] bg-n-900"
        >
          <span className="text-[14px] leading-[1.5] font-medium text-b-600">로그아웃</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="absolute inset-x-5 bottom-[42px] flex h-14 cursor-pointer items-center justify-center rounded-[16px] border-2 border-white/40 bg-p-500 shadow-[0_0_16px_0_rgba(255,255,255,0.10)]"
        >
          <span className="text-[14px] leading-[1.5] font-semibold text-b-200">
            회원가입 / 로그인하기
          </span>
        </button>
      )}
    </div>
  );
}

export default ProfilePage;
