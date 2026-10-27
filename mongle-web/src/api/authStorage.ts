// 로그인 토큰 저장소 (localStorage 읽기 · 쓰기를 여기 한 곳에서만 처리)
// TODO: client.ts 의 localStorage.getItem('accessToken') 도 이걸 쓰도록 교체
const ACCESS_TOKEN_KEY = 'accessToken';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  // TODO: 카카오 로그인 성공 시 호출
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  // TODO: 로그아웃 시 호출
  clear: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
};
