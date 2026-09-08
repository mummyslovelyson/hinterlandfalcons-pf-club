import { Registration } from '@/types/registration';
import { api, ApiError } from './api';

let cachedRegistrations: Registration[] = [];
let hasFetchedInitially = false;

// Custom event name for cross-component reactivity
export const REGISTRATIONS_SYNC_EVENT = 'pathfinder:registrations_sync';

export const syncRegistrationsFromBackend = async (): Promise<Registration[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!token) {
    return cachedRegistrations;
  }
  try {
    const data = await api<Registration[]>('/registrations');
    if (Array.isArray(data)) {
      cachedRegistrations = data;
      hasFetchedInitially = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(REGISTRATIONS_SYNC_EVENT, { detail: data }));
      }
      return data;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      return cachedRegistrations;
    }
    console.warn('Backend registrations sync notice:', err instanceof Error ? err.message : String(err));
  }
  return cachedRegistrations;
};

export const getRegistrations = (): Registration[] => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!hasFetchedInitially && typeof window !== 'undefined' && token) {
    syncRegistrationsFromBackend();
  }
  return [...cachedRegistrations];
};

export const getRegistrationById = (id: string): Registration | undefined => {
  return cachedRegistrations.find(r => r.id === id);
};

export const fetchRegistrationById = async (id: string): Promise<Registration | null> => {
  try {
    const data = await api<Registration>(`/registrations/${id}`);
    if (data) {
      const idx = cachedRegistrations.findIndex(r => r.id === id);
      if (idx !== -1) {
        cachedRegistrations[idx] = data;
      } else {
        cachedRegistrations.push(data);
      }
      return data;
    }
  } catch (err) {
    console.error(`Failed to fetch registration ${id}:`, err);
  }
  return getRegistrationById(id) || null;
};

export const saveRegistration = async (registration: Registration): Promise<Registration> => {
  try {
    const created = await api<Registration>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
    cachedRegistrations = [created, ...cachedRegistrations.filter(r => r.id !== created.id)];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REGISTRATIONS_SYNC_EVENT, { detail: cachedRegistrations }));
    }
    return created;
  } catch (err) {
    console.error('Failed to save registration to backend:', err);
    throw err;
  }
};

export const updateRegistration = async (id: string, updates: Partial<Registration>): Promise<void> => {
  const idx = cachedRegistrations.findIndex(r => r.id === id);
  if (idx !== -1) {
    cachedRegistrations[idx] = { ...cachedRegistrations[idx], ...updates };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REGISTRATIONS_SYNC_EVENT, { detail: cachedRegistrations }));
    }
  }

  try {
    const updated = await api<Registration>(`/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (updated && idx !== -1) {
      cachedRegistrations[idx] = updated;
    }
  } catch (err) {
    console.error(`Failed to update registration ${id} on backend:`, err);
    throw err;
  }
};

export const deleteRegistration = async (id: string): Promise<void> => {
  cachedRegistrations = cachedRegistrations.filter(r => r.id !== id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REGISTRATIONS_SYNC_EVENT, { detail: cachedRegistrations }));
  }

  try {
    await api(`/registrations/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error(`Failed to delete registration ${id} from backend:`, err);
    throw err;
  }
};

export const generateId = (): string => {
  return `PF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};
