// 로그인 Access Token 보관 (메모리에만 보관 · localStorage에 저장하지 않음)
// 새로고침하면 비워지고, AuthProvider가 앱 시작 시 Refresh 쿠키로 다시 받아온다
// 로그인 여부를 화면에서 쓸 때는 useAuth()를 사용 (이 값은 바뀌어도 화면이 다시 그려지지 않음)
let accessToken: string | null = null;

export const authStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
