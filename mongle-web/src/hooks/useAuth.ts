import { createContext, useContext } from 'react';

import type { AuthUser, Session } from '@/api/authApi';

// 로그인이 필요한 버튼을 로그아웃 상태에서 누르면 이동할 곳
export const LOGIN_PATH = '/login';

export interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  // 앱 시작 시 로그인 복구(Refresh) 확인 중
  isLoading: boolean;
  // 재발급 응답을 받아 로그인 상태로 전환
  signIn: (session: Session) => void;
  // 로그아웃 API 호출 후 로그인 상태 해제
  signOut: () => Promise<void>;
  // 닉네임 온보딩 등으로 바뀐 사용자 정보 반영
  updateUser: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

// 로그인 상태 (AuthProvider 안에서만 사용)
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }

  return context;
};
