const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://falcons-backend.onrender.com/api' : '/api');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Cross-site token support for cross-domain deployments (Vercel <-> Render)
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (path.includes('/logout') && typeof window !== 'undefined') {
    localStorage.removeItem('pf_auth_token');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', response.status);
  }

  if (data && typeof data === 'object' && 'token' in data && typeof data.token === 'string') {
    localStorage.setItem('pf_auth_token', data.token);
  }

  return data as T;
}
