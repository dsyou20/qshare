import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.176:16001/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API 요청:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("API 요청 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log("API 응답:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("API 응답 에러:", {
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
    name?: string;
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

export interface ShareScriptDto {
  shareWithAll?: boolean;
  userIds?: number[];
}

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface ShareInfo {
  script: {
    id: string;
    title: string;
    isPublic: boolean;
  };
  shares: User[];
}

export const getMyScripts = async (): Promise<Script[]> => {
  const response = await api.get("/scripts/my");

  // 디버깅용 로그
  console.log("받은 내 스크립트 목록 데이터:", response.data);

  // 각 스크립트의 content 필드를 code 필드로 변환
  return response.data.map((script: any) => {
    if (script.content && !script.code) {
      return {
        ...script,
        code: script.content,
        user: script.author || script.user,
      };
    }

    if (script.author && !script.user) {
      return {
        ...script,
        user: script.author,
      };
    }

    return script;
  });
};

export const getSharedScripts = async (): Promise<Script[]> => {
  const response = await api.get("/scripts/shared-with-me");

  // 디버깅용 로그
  console.log("받은 공유 스크립트 목록 데이터:", response.data);

  // 각 스크립트의 content 필드를 code 필드로 변환하고 author를 user로 변환
  return response.data.map((script: any) => {
    const transformed = {
      ...script,
      user: script.author || script.user,
    };

    if (script.content && !script.code) {
      transformed.code = script.content;
    }

    return transformed;
  });
};

export const getScript = async (id: string): Promise<Script> => {
  const response = await api.get(`/scripts/${id}`);

  // 백엔드에서 content 필드를 code 필드로 변환
  const scriptData = response.data;

  // 디버깅용 로그
  console.log("받은 스크립트 데이터:", scriptData);

  // content 필드가 있고 code 필드가 없는 경우 변환
  if (scriptData.content && !scriptData.code) {
    return {
      ...scriptData,
      code: scriptData.content,
      user: scriptData.author || scriptData.user,
    };
  }

  // author 필드를 user 필드로 변환 (일관성 유지)
  if (scriptData.author && !scriptData.user) {
    return {
      ...scriptData,
      user: scriptData.author,
    };
  }

  return scriptData;
};

export const createScript = async (data: CreateScriptDto): Promise<Script> => {
  // 유효성 검사 추가
  if (!data.code || data.code.trim() === "") {
    console.error("코드 필드가 비어 있습니다", data);
    throw new Error("스크립트 내용은 필수 항목입니다");
  }

  try {
    console.log("API 요청 데이터:", data);
    const response = await api.post("/scripts", data);
    console.log("API 응답 데이터:", response.data);
    return response.data;
  } catch (error) {
    console.error("API 응답 에러:", error);
    throw error;
  }
};

export const updateScript = async (
  id: string,
  data: UpdateScriptDto
): Promise<Script> => {
  // 유효성 검사
  if (data.code !== undefined && (!data.code || data.code.trim() === "")) {
    console.error("코드 필드가 비어 있습니다", data);
    throw new Error("스크립트 내용은 필수 항목입니다");
  }

  try {
    console.log("스크립트 업데이트 API 요청 데이터:", { id, data });
    const response = await api.patch(`/scripts/${id}`, data);
    console.log("스크립트 업데이트 API 응답 데이터:", response.data);

    // 백엔드에서 content 필드를 code 필드로 변환
    const scriptData = response.data;

    if (scriptData.content && !scriptData.code) {
      return {
        ...scriptData,
        code: scriptData.content,
        user: scriptData.author || scriptData.user,
      };
    }

    if (scriptData.author && !scriptData.user) {
      return {
        ...scriptData,
        user: scriptData.author,
      };
    }

    return scriptData;
  } catch (error) {
    console.error("스크립트 업데이트 API 응답 에러:", error);
    throw error;
  }
};

export const deleteScript = async (id: string): Promise<void> => {
  await api.delete(`/scripts/${id}`);
};

export const getShares = async (id: string): Promise<ShareInfo> => {
  const response = await api.get(`/scripts/${id}/shares`);
  return response.data;
};

export const shareScript = async (
  id: string,
  data: ShareScriptDto
): Promise<any> => {
  const response = await api.post(`/scripts/${id}/share`, data);
  return response.data;
};

export const removeShare = async (
  scriptId: string,
  userId: number
): Promise<any> => {
  const response = await api.delete(`/scripts/${scriptId}/share/${userId}`);
  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await api.get(
    `/users/search?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const makeUserAdmin = async (userId: number): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}/make-admin`);
  return response.data;
};

export const removeAdminRole = async (userId: number): Promise<User> => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  const response = await api.put(`/admin/users/${userId}/remove-admin`, {}, config);
  return response.data;
};
