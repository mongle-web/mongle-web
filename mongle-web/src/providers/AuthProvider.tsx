import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { logout, refreshSession } from '@/api/authApi';
import type { AuthUser, Session } from '@/api/authApi';
import { authStorage } from '@/api/authStorage';
import { setAuthHandlers } from '@/api/client';
import { AuthContext } from '@/hooks/useAuth';

// 앱 전체 로그인 상태
// 앱 시작 시 Refresh 쿠키로 로그인을 한 번 복구하고, 확인이 끝난 뒤에 화면을 그린다
// (확인 전에 화면을 그리면 로그인 사용자에게 로그아웃 화면이 잠깐 보이거나, 토큰이 필요한 화면이 먼저 실패함)
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = useCallback((session: Session) => {
    authStorage.setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      // 서버 로그아웃이 실패해도 이 기기의 로그인 상태는 해제
      authStorage.clear();
      setUser(null);
    }
  }, []);

  // API 요청 중 401 → 재발급 결과를 로그인 상태에 반영
  useEffect(() => {
    setAuthHandlers({
      onRefreshed: signIn,
      onExpired: () => setUser(null),
    });

    return () => setAuthHandlers(null);
  }, [signIn]);

  useEffect(() => {
    // refreshSession은 진행 중인 요청을 공유하므로 StrictMode에서 두 번 실행돼도 요청은 한 번
    refreshSession()
      .then(signIn)
      .catch(() => {
        // Refresh 쿠키가 없거나 만료 → 로그아웃 상태
        authStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [signIn]);

  const value = useMemo(
    () => ({ user, isLoggedIn: user !== null, isLoading, signIn, signOut, updateUser: setUser }),
    [user, isLoading, signIn, signOut],
  );

  // TODO: 확인 중 화면 디자인 (현재는 빈 화면)
  return <AuthContext.Provider value={value}>{isLoading ? null : children}</AuthContext.Provider>;
}

export default AuthProvider;
