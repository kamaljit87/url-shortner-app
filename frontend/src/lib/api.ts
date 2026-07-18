const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error ?? 'Something went wrong. Please try again.');
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  lastAccessed: string | null;
}

export const authApi = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: (token: string) =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST', token }),
};

export const urlApi = {
  list: (token: string) => request<ShortUrl[]>('/api/urls', { token }),
  create: (token: string, originalUrl: string, customAlias?: string) =>
    request<ShortUrl>('/api/urls', {
      method: 'POST',
      token,
      body: JSON.stringify({ originalUrl, customAlias: customAlias || undefined }),
    }),
  update: (token: string, id: string, originalUrl: string, customAlias?: string) =>
    request<ShortUrl>(`/api/urls/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ originalUrl, customAlias: customAlias || undefined }),
    }),
  remove: (token: string, id: string) =>
    request<void>(`/api/urls/${id}`, { method: 'DELETE', token }),
};
