/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { Registration } from '@/types/registration';
import { ChurchMember } from '@/types/church';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  church: string;
  category: string;
  classLevel: string;
  status: string;
  dateOfBirth: string;
  address: string;
  profilePhoto?: string;
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  submittedAt?: string;
  hasFullDressUniform?: boolean;
  completedClasses?: string[];
  rawType: 'registration' | 'church_member';
  rawRecord: Registration | ChurchMember;
}

export type UserRecordResponse =
  | { type: 'registration'; record: Registration }
  | { type: 'church_member'; record: ChurchMember };

interface UserAuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (referenceId: string, contact?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }) => Promise<boolean>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

function mapRawToUserProfile(data: UserRecordResponse): UserProfile {
  if (data.type === 'registration') {
    const reg = data.record;
    return {
      id: reg.id,
      fullName: reg.applicant?.fullName || 'Member',
      phone: reg.applicant?.phone || '',
      email: reg.applicant?.school || '',
      church: reg.applicant?.church || 'Santasi SDA Church',
      category: reg.membership?.membershipCategory || 'Pathfinder',
      classLevel: reg.membership?.completedClasses?.[0] || 'Friend',
      status: reg.status,
      dateOfBirth: reg.applicant?.dateOfBirth || '',
      address: reg.applicant?.address || '',
      profilePhoto: reg.applicant?.profileImage,
      guardianName: reg.guardian?.fullName,
      guardianPhone: reg.guardian?.phone,
      emergencyContact: reg.guardian?.fullName,
      emergencyPhone: reg.guardian?.phone,
      notes: reg.notes,
      submittedAt: reg.submittedAt,
      hasFullDressUniform: reg.membership?.hasFullDressUniform,
      completedClasses: reg.membership?.completedClasses || [],
      rawType: 'registration',
      rawRecord: reg,
    };
  } else {
    const mem = data.record;
    return {
      id: mem.id,
      fullName: `${mem.firstName} ${mem.lastName}`.trim(),
      phone: mem.phone || '',
      email: mem.email || '',
      church: 'Santasi AYM District',
      category: mem.membershipCategory || 'Pathfinder',
      classLevel: mem.pathfinderClass || 'Friend',
      status: mem.status || 'active',
      dateOfBirth: mem.dateOfBirth || '',
      address: mem.address || '',
      profilePhoto: mem.profilePhoto,
      guardianName: mem.parentGuardianName,
      guardianPhone: mem.parentGuardianPhone,
      emergencyContact: mem.emergencyContact,
      emergencyPhone: mem.emergencyPhone,
      notes: mem.specialNotes,
      submittedAt: mem.createdAt,
      hasFullDressUniform: true,
      completedClasses: [mem.pathfinderClass || 'Friend'],
      rawType: 'church_member',
      rawRecord: mem,
    };
  }
}

import { getRegistrations } from '@/lib/registrations';

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api<UserRecordResponse>('/user/me');
      if (res && res.record) {
        const mapped = mapRawToUserProfile(res);
        setUser(mapped);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pathfinder_user_session', JSON.stringify(mapped));
        }
        return;
      }
    } catch {
      // Backend not authenticated or offline, check local storage
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pathfinder_user_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserProfile;
          // Refresh against latest registrations if available
          const localRegs = getRegistrations();
          const fresh = localRegs.find((r) => r.id === parsed.id);
          if (fresh) {
            const freshMapped = mapRawToUserProfile({ type: 'registration', record: fresh });
            setUser(freshMapped);
            localStorage.setItem('pathfinder_user_session', JSON.stringify(freshMapped));
          } else {
            setUser(parsed);
          }
          return;
        } catch {
          // ignore parsing error
        }
      }
    }

    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (referenceId: string, contact?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const cleanRef = (referenceId || '').trim();
    const cleanContact = (contact || '').trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. Try Backend API first
    try {
      const res = await api<UserRecordResponse>('/user/login', {
        method: 'POST',
        body: JSON.stringify({ referenceId: cleanRef, contact: cleanContact }),
      });
      if (res && res.record) {
        const mapped = mapRawToUserProfile(res);
        setUser(mapped);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pathfinder_user_session', JSON.stringify(mapped));
        }
        setIsLoading(false);
        return { success: true };
      }
    } catch {
      // Proceed to local fallback if backend is unreachable or returns error
    }

    // 2. Offline / Client-Side Fallback: Match against registrations
    const localRegs = getRegistrations();
    const matched = localRegs.find((r) => {
      const idMatches = cleanRef && r.id.toLowerCase() === cleanRef.toLowerCase();
      const applicantPhone = (r.applicant?.phone || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const guardianPhone = (r.guardian?.phone || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const nameMatches = cleanContact && (r.applicant?.fullName || '').toLowerCase().includes(cleanContact);
      const contactMatches = cleanContact && (
        applicantPhone.includes(cleanContact) ||
        guardianPhone.includes(cleanContact) ||
        nameMatches
      );

      if (cleanRef && cleanContact) return idMatches || contactMatches;
      if (cleanRef) return idMatches;
      if (cleanContact) return contactMatches;
      return false;
    });

    if (matched) {
      const mapped = mapRawToUserProfile({ type: 'registration', record: matched });
      setUser(mapped);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathfinder_user_session', JSON.stringify(mapped));
      }
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      message: 'No matching member or registration found. Please verify your Reference ID or Phone Number.',
    };
  };

  const logout = async () => {
    try {
      await api('/user/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathfinder_user_session');
      }
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateProfile = async (data: {
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }) => {
    try {
      await api('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await fetchCurrentUser();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
