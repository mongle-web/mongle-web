import { authStorage } from '@/api/authStorage';

// 로그인이 필요한 버튼을 로그아웃 상태에서 누르면 이동할 곳
export const LOGIN_PATH = '/login';

// 로그인 여부 (현재는 accessToken 유무로 판단)
// TODO: 토큰 만료 확인 등이 필요해지면 이 훅 안만 수정
// 개발 중 확인: 콘솔에서 localStorage.setItem('accessToken', 'test') / removeItem('accessToken')
export const useAuth = () => {
  const isLoggedIn = Boolean(authStorage.getAccessToken());

  return { isLoggedIn };
};
