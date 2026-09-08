import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Church } from '@/types/church';
import { api } from '@/lib/api';

interface ChurchAuthContextType {
  church: Church | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshChurch: () => Promise<void>;
}

const ChurchAuthContext = createContext<ChurchAuthContextType>({
  church: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => undefined,
  refreshChurch: async () => undefined,
});

const defaultSantasiChurch: Church = {
  id: 'CH-SANTASI',
  name: 'Santasi SDA Church',
  district: 'Santasi District',
  pastorName: 'Pastor Kwabena Mensah',
  contactEmail: 'santasi@hinterlandfalcons.org',
  contactPhone: '+233 24 412 3456',
  location: 'Santasi, Kumasi',
  username: 'santasi_clerk',
  password: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const ChurchAuthProvider = ({ children }: { children: ReactNode }) => {
  const [church, setChurch] = useState<Church | null>(() => {
    try {
      const saved = localStorage.getItem('church_portal_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultSantasiChurch;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api<Church>('/auth/church/me')
      .then((serverChurch) => {
        if (serverChurch && serverChurch.id) {
          setChurch(serverChurch);
          localStorage.setItem('church_portal_session', JSON.stringify(serverChurch));
        } else {
          setChurch((prev) => prev || defaultSantasiChurch);
        }
      })
      .catch(() => {
        setChurch((prev) => prev || defaultSantasiChurch);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await api<Church>('/auth/church/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setChurch(result);
      localStorage.setItem('church_portal_session', JSON.stringify(result));
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await api('/auth/church/logout', { method: 'POST' }).catch(() => undefined);
    localStorage.removeItem('church_portal_session');
    setChurch(defaultSantasiChurch);
  };

  const refreshChurch = async () => {
    try {
      const result = await api<Church>('/auth/church/me');
      if (result) {
        setChurch(result);
        localStorage.setItem('church_portal_session', JSON.stringify(result));
      }
    } catch {
      // ignore
    }
  };

  return (
    <ChurchAuthContext.Provider
      value={{
        church,
        isAuthenticated: !!church,
        isLoading,
        login,
        logout,
        refreshChurch,
      }}
    >
      {children}
    </ChurchAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChurchAuth = () => useContext(ChurchAuthContext);
