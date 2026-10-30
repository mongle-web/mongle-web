import axios from 'axios';

import { authStorage } from '@/api/authStorage';

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

// ─────────────────────────────────────────────
// 개발용 가짜 로그인 (로컬에서 백엔드 없이 화면 흐름 확인용)
// .env.local 에 VITE_AUTH_MOCK=true 를 넣고 개발 서버(pnpm run dev)에서만 동작 (배포 빌드에서는 항상 꺼짐)
// 상태: 없음(로그아웃) → 카카오 버튼 시 'new'(신규 회원) → 닉네임 온보딩 후 'member'(기존 회원)
// 기존 회원으로 바로 보려면 콘솔: localStorage.setItem('mongle:mock-auth', 'member')
// 실제 API까지 로컬에서 테스트하려면 VITE_DEV_ACCESS_TOKEN 에 진짜 Access Token을 함께 넣기 (만료되면 다시 넣기)
// ─────────────────────────────────────────────
export const IS_AUTH_MOCK = import.meta.env.DEV && import.meta.env.VITE_AUTH_MOCK === 'true';
const MOCK_AUTH_KEY = 'mongle:mock-auth';
type MockAuthState = 'new' | 'member';

const getMockState = () => localStorage.getItem(MOCK_AUTH_KEY) as MockAuthState | null;
export const setMockAuthState = (state: MockAuthState | null) => {
  if (state) localStorage.setItem(MOCK_AUTH_KEY, state);
  else localStorage.removeItem(MOCK_AUTH_KEY);
};

const createMockSession = (state: MockAuthState): Session => ({
  // .env.local 에 VITE_DEV_ACCESS_TOKEN(배포 사이트에서 로그인 후 받은 진짜 토큰)이 있으면 실제 API도 로컬에서 호출 가능
  accessToken: import.meta.env.VITE_DEV_ACCESS_TOKEN || 'mock-access-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    userId: 1,
    email: 'mock@mongle.art',
    nickname: state === 'member' ? '몽글이' : null,
    onboardingCompleted: state === 'member',
  },
});

// 카카오 로그인 시작 (mock이면 백엔드 대신 바로 로그인 완료 페이지로)
export const startKakaoLogin = () => {
  if (IS_AUTH_MOCK) {
    if (getMockState() !== 'member') setMockAuthState('new');
    window.location.href = '/auth/callback';
    return;
  }

  window.location.href = KAKAO_LOGIN_URL;
};

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

  if (IS_AUTH_MOCK) {
    const state = getMockState();
    return state
      ? Promise.resolve(createMockSession(state))
      : Promise.reject(new Error('로그인 필요'));
  }

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

// 닉네임 온보딩 완료 (가입 마무리, 최초 완료 시 3크레딧 지급)
// 로그인 직후 호출되므로 apiClient 대신 authClient에 Bearer를 직접 붙임 (client.ts와 서로 import 하지 않도록)
export const completeOnboarding = async (nickname: string): Promise<AuthUser> => {
  if (IS_AUTH_MOCK) {
    setMockAuthState('member');
    return { ...createMockSession('member').user, nickname };
  }

  const response = await authClient.post<ApiResponse<AuthUser>>(
    '/api/v1/users/me/onboarding',
    { nickname },
    { headers: { Authorization: `Bearer ${authStorage.getAccessToken()}` } },
  );
  return response.data.data;
};

// 로그아웃 (현재 기기의 Refresh 쿠키 삭제, 다른 기기 로그인은 유지)
export const logout = async (): Promise<void> => {
  if (IS_AUTH_MOCK) {
    setMockAuthState(null);
    return;
  }

  const csrf = await getCsrfToken();
  await authClient.post('/api/v1/auth/logout', null, {
    headers: { [csrf.headerName]: csrf.token },
  });
};
