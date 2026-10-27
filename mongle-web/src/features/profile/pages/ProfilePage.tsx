import { useNavigate } from 'react-router-dom';

import { authStorage } from '@/api/authStorage';
import { BackHeader } from '@/components/common';
import EditIcon from '@/features/profile/components/EditIcon';
import ProfileIcon from '@/features/profile/components/ProfileIcon';
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
          <ProfileIcon className="size-[90px]" />

          {/* TODO: 누르면 편집 동작되게 */}
          {isLoggedIn && (
            <button
              type="button"
              aria-label="프로필 편집"
              className="absolute right-[-4px] bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-n-300"
            >
              <EditIcon className="size-[22.375px] text-n-800" />
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
