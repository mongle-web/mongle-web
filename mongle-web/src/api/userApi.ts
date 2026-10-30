import { createMockSession, IS_AUTH_MOCK, setMockAuthState } from '@/api/authApi';
import type { ApiResponse, AuthUser } from '@/api/authApi';
import { apiClient } from '@/api/client';

// 회원 API (내 정보 조회 · 닉네임 온보딩 · 닉네임 변경)
// mock 로그인(VITE_AUTH_MOCK)이고 개발 토큰이 없으면 서버 대신 가짜 사용자로 응답
const USE_MOCK = IS_AUTH_MOCK && !import.meta.env.VITE_DEV_ACCESS_TOKEN;

// 내 정보 조회 (온보딩 전에도 조회 가능)
export const getMe = async (): Promise<AuthUser> => {
  if (USE_MOCK) return createMockSession('member').user;

  const response = await apiClient.get<ApiResponse<AuthUser>>('/api/v1/users/me');
  return response.data.data;
};

// 닉네임 온보딩 완료 (가입 마무리, 최초 완료 시 3크레딧 지급)
export const completeOnboarding = async (nickname: string): Promise<AuthUser> => {
  if (USE_MOCK) {
    setMockAuthState('member');
    return { ...createMockSession('member').user, nickname };
  }

  const response = await apiClient.post<ApiResponse<AuthUser>>('/api/v1/users/me/onboarding', {
    nickname,
  });
  return response.data.data;
};

// 내 닉네임 변경 (한글 · 영문 · 숫자 2~10자)
export const updateNickname = async (nickname: string): Promise<AuthUser> => {
  if (USE_MOCK) return { ...createMockSession('member').user, nickname };

  const response = await apiClient.patch<ApiResponse<AuthUser>>('/api/v1/users/me/nickname', {
    nickname,
  });
  return response.data.data;
};
