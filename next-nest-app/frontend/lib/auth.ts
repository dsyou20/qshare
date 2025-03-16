import axios from 'axios';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API 요청:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    const token = localStorage.getItem('token');
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
    console.log('API 응답:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API 응답 에러:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  const response = await api.post<{ access_token: string; user: User }>('/auth/login', {
    email,
    password,
  });
  return { token: response.data.access_token, user: response.data.user };
};

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post<{ access_token: string; user: User }>('/auth/register', {
    email,
    password,
    name,
  });
  return { token: response.data.access_token, user: response.data.user };
};

export const logout = async () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  } catch (error) {
    return null;
  }
}; 