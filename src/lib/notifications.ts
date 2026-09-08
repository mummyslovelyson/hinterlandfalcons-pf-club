import { api, ApiError } from './api';

export interface NotificationItem {
  id: string;
  category: 'Intake' | 'Uniform' | 'Drill' | 'Camporee' | 'Church' | 'General';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
  church?: string;
  createdAt: string;
}

export const NOTIFICATIONS_UPDATED_EVENT = 'pathfinder_notifications_updated';

let cachedNotifications: NotificationItem[] = [];
let hasFetchedNotifications = false;

const dispatchUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }
};

export const syncNotificationsFromBackend = async (): Promise<NotificationItem[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!token) {
    return cachedNotifications;
  }
  try {
    const remote = await api<NotificationItem[]>('/notifications');
    if (Array.isArray(remote)) {
      cachedNotifications = remote;
      hasFetchedNotifications = true;
      dispatchUpdate();
      return remote;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      return cachedNotifications;
    }
    console.warn('[Notifications] Backend sync notice:', err instanceof Error ? err.message : String(err));
  }
  return cachedNotifications;
};

export const getNotifications = (): NotificationItem[] => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pf_auth_token') : null;
  if (!hasFetchedNotifications && typeof window !== 'undefined' && token) {
    syncNotificationsFromBackend();
  }
  return [...cachedNotifications];
};

export const getChurchNotifications = (churchName?: string): NotificationItem[] => {
  const all = getNotifications();
  if (!churchName) return all;
  return all.filter((n) => !n.church || n.church === churchName);
};

export const addNotification = async (
  item: Omit<NotificationItem, 'id' | 'createdAt' | 'read' | 'time'> & { id?: string; read?: boolean; time?: string }
): Promise<NotificationItem> => {
  const payload = {
    id: item.id || `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: item.category,
    title: item.title,
    description: item.description,
    time: item.time || 'Just now',
    read: item.read ?? false,
    link: item.link,
    church: item.church,
    createdAt: new Date().toISOString(),
  };

  const saved = await api<NotificationItem>('/notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  cachedNotifications = [saved, ...cachedNotifications.filter((n) => n.id !== saved.id)];
  dispatchUpdate();
  return saved;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api(`/notifications/${id}/read`, { method: 'PUT' });
  cachedNotifications = cachedNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  dispatchUpdate();
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api('/notifications/read-all', { method: 'PUT' });
  cachedNotifications = cachedNotifications.map((n) => ({ ...n, read: true }));
  dispatchUpdate();
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api(`/notifications/${id}`, { method: 'DELETE' });
  cachedNotifications = cachedNotifications.filter((n) => n.id !== id);
  dispatchUpdate();
};

export const clearAllNotifications = async (): Promise<void> => {
  await api('/notifications', { method: 'DELETE' });
  cachedNotifications = [];
  dispatchUpdate();
};
