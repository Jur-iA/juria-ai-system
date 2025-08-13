// Centralized API client with JWT injection
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Json = any;

type RequestInitLite = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> };

function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem('token');
  const base: Record<string, string> = extra ? { ...extra } : {};
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
}

async function handle<T = Json>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch { /* keep raw text */ }
  if (!res.ok) {
    if (res.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      // auto logout on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('is_demo');
      localStorage.removeItem('demo_expires_at');
      // redirect to login preserving intent
      if (hadToken && typeof window !== 'undefined') {
        window.location.href = `/?expired=1`;
      }
    }
    const msg = (data && (data.error || data.message)) || `${res.status} ${text}`;
    throw new Error(msg);
  }
  return (data as T);
}

export const api = {
  baseUrl: API_BASE,

  async get<T = Json>(path: string, init?: RequestInitLite): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init || {}),
      method: 'GET',
      headers: authHeaders(init?.headers),
    });
    return handle<T>(res);
  },

  async post<T = Json>(path: string, body?: any, init?: RequestInitLite): Promise<T> {
    const headers = authHeaders({ 'Content-Type': 'application/json', ...(init?.headers || {}) });
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init || {}),
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle<T>(res);
  },

  async put<T = Json>(path: string, body?: any, init?: RequestInitLite): Promise<T> {
    const headers = authHeaders({ 'Content-Type': 'application/json', ...(init?.headers || {}) });
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init || {}),
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle<T>(res);
  },

  async patch<T = Json>(path: string, body?: any, init?: RequestInitLite): Promise<T> {
    const headers = authHeaders({ 'Content-Type': 'application/json', ...(init?.headers || {}) });
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init || {}),
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle<T>(res);
  },

  async del<T = Json>(path: string, init?: RequestInitLite): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...(init || {}),
      method: 'DELETE',
      headers: authHeaders(init?.headers),
    });
    return handle<T>(res);
  },
};
