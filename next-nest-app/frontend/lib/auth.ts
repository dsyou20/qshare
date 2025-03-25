import axios from 'axios';
import Cookies from 'js-cookie';

export interface User {
  role: string;
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

const TOKEN_COOKIE_NAME = 'qshare_token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.100.176:16001/api',
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러시 토큰 삭제
      Cookies.remove(TOKEN_COOKIE_NAME);
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  const response = await api.post<{ access_token: string; user: User }>('/auth/login', {
    email,
    password,
  });
  const { access_token, user } = response.data;
  // 쿠키에 토큰 저장 (7일 유효)
  Cookies.set(TOKEN_COOKIE_NAME, access_token, { expires: 7 });
  return { token: access_token, user };
};

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post<{ access_token: string; user: User }>('/auth/register', {
    email,
    password,
    name,
  });
  const { access_token, user } = response.data;
  // 쿠키에 토큰 저장 (7일 유효)
  Cookies.set(TOKEN_COOKIE_NAME, access_token, { expires: 7 });
  return { token: access_token, user };
};

export const logout = async () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE_NAME);
}; 