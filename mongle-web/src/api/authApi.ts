import axios from 'axios';

// 로그인 · 로그아웃 관련 API (백엔드 문서: mongle-server docs/kakao-oauth-web.md)
// Refresh · CSRF 쿠키를 주고받아야 해서 apiClient와 따로 withCredentials 인스턴스를 사용
// (apiClient의 401 → 재발급 처리와 서로 맞물려 무한 반복되지 않도록 분리)
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// 카카오 로그인 시작 주소 (axios로 부르지 않고 브라우저 주소를 이 주소로 이동)
export const KAKAO_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

interface CsrfToken {
  headerName: string;
  token: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  nickname: string | null;
  onboardingCompleted: boolean;
}

export interface Session {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

// CSRF 토큰 조회 (재발급 · 로그아웃 요청 헤더에 넣음)
export const getCsrfToken = async (): Promise<CsrfToken> => {
  const response = await authClient.get<ApiResponse<CsrfToken>>('/api/v1/auth/csrf');
  return response.data.data;
};

// 진행 중인 재발급 요청 (동시에 여러 번 부르면 하나로 합침)
let refreshing: Promise<Session> | undefined;

// Access Token 재발급 (로그인 완료 화면 · 새로고침 시 로그인 복구 · 401 처리에서 공통 사용)
// 이전 Refresh 토큰을 다시 쓰면 서버가 세션을 폐기하므로 절대 병렬로 호출하지 않는다
export const refreshSession = (): Promise<Session> => {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const csrf = await getCsrfToken();
    const response = await authClient.post<ApiResponse<Session>>('/api/v1/auth/refresh', null, {
      headers: { [csrf.headerName]: csrf.token },
    });
    return response.data.data;
  })().finally(() => {
    refreshing = undefined;
  });

  return refreshing;
};

// 로그아웃 (현재 기기의 Refresh 쿠키 삭제, 다른 기기 로그인은 유지)
export const logout = async (): Promise<void> => {
  const csrf = await getCsrfToken();
  await authClient.post('/api/v1/auth/logout', null, {
    headers: { [csrf.headerName]: csrf.token },
  });
};
