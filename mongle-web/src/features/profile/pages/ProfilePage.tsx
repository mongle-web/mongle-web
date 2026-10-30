import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { getMe } from '@/api/userApi';
import { BackHeader } from '@/components/common';
import EditIcon from '@/features/profile/components/EditIcon';
import ProfileIcon from '@/features/profile/components/ProfileIcon';
import { LOGIN_PATH, useAuth } from '@/hooks/useAuth';

// 마이페이지 (로그인 상태에 따라 로그아웃 버튼 / 로그인 버튼)
function ProfilePage() {
  const navigate = useNavigate();
  // 닉네임은 로그인(Refresh) · 온보딩 응답의 사용자 정보를 그대로 사용
  const { isLoggedIn, user, signOut, updateUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 들어올 때 서버의 최신 내 정보로 갱신 (실패하면 로그인 때 받은 정보 그대로 표시)
  useEffect(() => {
    if (!isLoggedIn) return;

    getMe()
      .then(updateUser)
      .catch(() => {});
  }, [isLoggedIn, updateUser]);

  const handleLogin = () => {
    navigate(LOGIN_PATH);
  };

  // 서버 로그아웃 후 로그인 상태 해제 → 홈 (실패해도 이 기기는 로그아웃 처리됨)
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
    } finally {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-dvh bg-b-900">
      <BackHeader title="마이페이지" />

      <section className="mx-auto mt-[106px] flex w-fit flex-col items-center gap-5">
        <div className="relative size-[90px]">
          <ProfileIcon className="size-[90px]" />

          {/* 편집 배지 → 닉네임 수정 */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => navigate('/profile/nickname')}
              aria-label="프로필 편집"
              className="absolute right-[-4px] bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-n-300"
            >
              <EditIcon className="size-[22.375px] text-n-800" />
            </button>
          )}
        </div>

        {isLoggedIn ? (
          <p className="w-[145px] rounded-[16px] bg-n-900 px-5 py-3 text-center text-[14px] leading-[1.5] font-medium text-b-200">
            {user?.nickname}
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
          disabled={isLoggingOut}
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
