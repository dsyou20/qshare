import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API 요청:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
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

export interface Script {
  id: string;
  title: string;
  description?: string;
  code: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
  };
}

export interface CreateScriptDto {
  title: string;
  description?: string;
  code: string;
  isPublic?: boolean;
}

export interface UpdateScriptDto {
  title?: string;
  description?: string;
  code?: string;
  isPublic?: boolean;
}

export const getMyScripts = async (): Promise<Script[]> => {
  const response = await api.get('/scripts/my');
  return response.data;
};

export const getScript = async (id: string): Promise<Script> => {
  const response = await api.get(`/scripts/${id}`);
  return response.data;
};

export const createScript = async (data: CreateScriptDto): Promise<Script> => {
  const response = await api.post('/scripts', data);
  return response.data;
};

export const updateScript = async (id: string, data: UpdateScriptDto): Promise<Script> => {
  const response = await api.patch(`/scripts/${id}`, data);
  return response.data;
};

export const deleteScript = async (id: string): Promise<void> => {
  await api.delete(`/scripts/${id}`);
}; 