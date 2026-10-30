import { Navigate } from 'react-router-dom';

import { LOGIN_PATH, useAuth } from '@/hooks/useAuth';

// 카카오 로그인 완료 후 백엔드가 돌려보내는 페이지 (/auth/callback)
// 앱 시작 시 AuthProvider가 Refresh 쿠키로 로그인 확인을 끝낸 뒤 그려지므로, 결과만 보고 바로 이동
function AuthCallbackPage() {
  const { isLoggedIn, user } = useAuth();

  // 로그인 확인 실패 (Refresh 쿠키 없음 · 만료)
  if (!isLoggedIn || !user) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  // 신규 회원 → 닉네임 온보딩, 기존 회원 → 홈
  return <Navigate to={user.onboardingCompleted ? '/' : '/signup/nickname'} replace />;
}

export default AuthCallbackPage;
