import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import { refreshSession } from '@/api/authApi';
import type { Session } from '@/api/authApi';
import { authStorage } from '@/api/authStorage';

// Spring Boot API 연결을 여기 파일 하나로 통일하는 걸로
// 앞으로 팀원들은 직접 axios.get(...) 하면 안 되고 apiClient.get(...)을 기준으로 사용하면 됨.

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 401 → 재발급 결과를 화면의 로그인 상태(AuthProvider)에도 반영하기 위한 연결
interface AuthHandlers {
  onRefreshed: (session: Session) => void;
  onExpired: () => void;
}

let authHandlers: AuthHandlers | null = null;

export const setAuthHandlers = (handlers: AuthHandlers | null) => {
  authHandlers = handlers;
};

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = authStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 같은 요청을 두 번 이상 재시도하지 않도록 표시
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;

    // Access Token 만료(401)면 재발급 후 한 번만 다시 요청
    // refreshSession은 진행 중인 요청을 공유하므로 여러 요청이 동시에 401이어도 재발급은 한 번
    if (axios.isAxiosError(error) && error.response?.status === 401 && config && !config._retried) {
      config._retried = true;

      try {
        const session = await refreshSession();
        authStorage.setAccessToken(session.accessToken);
        authHandlers?.onRefreshed(session);

        return apiClient(config);
      } catch {
        // 재발급도 실패 → 로그아웃 상태로 전환하고 원래 401 에러를 그대로 전달
        authStorage.clear();
        authHandlers?.onExpired();
      }
    }

    return Promise.reject(error);
  },
);
