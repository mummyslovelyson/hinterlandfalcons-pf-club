import { UniformRequest } from '@/types/uniform';
import { api, ApiError } from './api';

let cachedUniformRequests: UniformRequest[] = [];
let hasFetchedUniforms = false;

export const UNIFORMS_SYNC_EVENT = 'pathfinder:uniforms_sync';

export const syncUniformRequestsFromBackend = async (): Promise<UniformRequest[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!token) {
    return cachedUniformRequests;
  }
  try {
    const data = await api<UniformRequest[]>('/uniforms');
    if (Array.isArray(data)) {
      cachedUniformRequests = data;
      hasFetchedUniforms = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(UNIFORMS_SYNC_EVENT, { detail: data }));
      }
      return data;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      return cachedUniformRequests;
    }
    console.warn('Backend uniforms sync notice:', err instanceof Error ? err.message : String(err));
  }
  return cachedUniformRequests;
};

export const getUniformRequests = (): UniformRequest[] => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!hasFetchedUniforms && typeof window !== 'undefined' && token) {
    syncUniformRequestsFromBackend();
  }
  return [...cachedUniformRequests];
};

export const saveUniformRequest = async (request: UniformRequest, _notify?: boolean): Promise<UniformRequest> => {
  try {
    const created = await api<UniformRequest>('/uniforms', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    cachedUniformRequests = [created, ...cachedUniformRequests.filter(u => u.id !== created.id)];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNIFORMS_SYNC_EVENT, { detail: cachedUniformRequests }));
    }
    return created;
  } catch (err) {
    console.error('Failed to save uniform request to backend:', err);
    throw err;
  }
};

export const updateUniformRequest = async (
  id: string,
  updates: Partial<UniformRequest>
): Promise<UniformRequest | null> => {
  const idx = cachedUniformRequests.findIndex(u => u.id === id);
  if (idx !== -1) {
    cachedUniformRequests[idx] = { ...cachedUniformRequests[idx], ...updates };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNIFORMS_SYNC_EVENT, { detail: cachedUniformRequests }));
    }
  }

  try {
    const updated = await api<UniformRequest>(`/uniforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (updated && idx !== -1) {
      cachedUniformRequests[idx] = updated;
    }
    return updated;
  } catch (err) {
    console.error(`Failed to update uniform request ${id} on backend:`, err);
    throw err;
  }
};

export const deleteUniformRequest = async (id: string): Promise<void> => {
  cachedUniformRequests = cachedUniformRequests.filter(u => u.id !== id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UNIFORMS_SYNC_EVENT, { detail: cachedUniformRequests }));
  }

  try {
    await api(`/uniforms/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error(`Failed to delete uniform request ${id} from backend:`, err);
    throw err;
  }
};

export const generateUniformId = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100 + Math.random() * 900);
  return `UNI-${year}-${rand}`;
};
