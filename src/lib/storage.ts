import { Registration } from '@/types/registration';

const STORAGE_KEY = 'pathfinder_registrations';

export const getRegistrations = (): Registration[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRegistration = (registration: Registration): void => {
  const registrations = getRegistrations();
  registrations.push(registration);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
};

export const updateRegistration = (id: string, updates: Partial<Registration>): void => {
  const registrations = getRegistrations();
  const index = registrations.findIndex(r => r.id === id);
  if (index !== -1) {
    registrations[index] = { ...registrations[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  }
};

export const getRegistrationById = (id: string): Registration | undefined => {
  const registrations = getRegistrations();
  return registrations.find(r => r.id === id);
};

export const deleteRegistration = (id: string): void => {
  const registrations = getRegistrations();
  const filtered = registrations.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const generateId = (): string => {
  return `PF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
