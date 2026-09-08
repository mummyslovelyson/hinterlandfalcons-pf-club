import { Church, ChurchMember } from '@/types/church';
import { Registration } from '@/types/registration';
import { api } from './api';

export const DEFAULT_DISTRICT_CHURCHES: Church[] = [
  { id: 'CH-SANTASI-CENTRAL', name: 'Santasi Central SDA Church', pastorName: 'Pastor J. Appiah', contactPhone: '0244123456', contactEmail: 'santasi.central@sda.org', location: 'Santasi Central', district: 'Santasi District', username: 'santasi_central_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
  { id: 'CH-SANTASI-SOUTH', name: 'Santasi South SDA Church', pastorName: 'Pastor K. Mensah', contactPhone: '0244123457', contactEmail: 'santasi.south@sda.org', location: 'Santasi South', district: 'Santasi District', username: 'santasi_south_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
  { id: 'CH-ANYINAM', name: 'Anyinam SDA Church', pastorName: 'Pastor E. Osei', contactPhone: '0244123458', contactEmail: 'anyinam@sda.org', location: 'Anyinam', district: 'Santasi District', username: 'anyinam_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
  { id: 'CH-KOKOBEN', name: 'Kokoben SDA Church', pastorName: 'Pastor P. Frimpong', contactPhone: '0244123459', contactEmail: 'kokoben@sda.org', location: 'Kokoben', district: 'Santasi District', username: 'kokoben_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
  { id: 'CH-APIRE', name: 'Apire SDA Church', pastorName: 'Pastor S. Darko', contactPhone: '0244123460', contactEmail: 'apire@sda.org', location: 'Apire', district: 'Santasi District', username: 'apire_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
  { id: 'CH-ADUMASA', name: 'Adumasa SDA Church', pastorName: 'Pastor A. Boakye', contactPhone: '0244123461', contactEmail: 'adumasa@sda.org', location: 'Adumasa', district: 'Santasi District', username: 'adumasa_clerk', password: 'Pathfinder@2026', createdAt: '2026-01-01' },
];

const loadInitialChurches = (): Church[] => {
  if (typeof window === 'undefined') return DEFAULT_DISTRICT_CHURCHES;
  try {
    const raw = localStorage.getItem('pathfinder_churches');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse cached churches:', e);
  }
  return DEFAULT_DISTRICT_CHURCHES;
};

let cachedChurches: Church[] = loadInitialChurches();
let cachedMembers: ChurchMember[] = [];
let hasFetchedChurches = false;
let hasFetchedMembers = false;

export const CHURCHES_SYNC_EVENT = 'pathfinder:churches_sync';
export const CHURCH_MEMBERS_SYNC_EVENT = 'pathfinder:church_members_sync';

// -------------------------------------------------------------
// Churches API Operations (MySQL backed via Express /api/churches)
// -------------------------------------------------------------

export const syncChurchesFromBackend = async (): Promise<Church[]> => {
  try {
    const data = await api<Church[]>('/churches');
    if (Array.isArray(data) && data.length > 0) {
      cachedChurches = data;
      hasFetchedChurches = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathfinder_churches', JSON.stringify(data));
        window.dispatchEvent(new CustomEvent(CHURCHES_SYNC_EVENT, { detail: data }));
      }
      return data;
    }
  } catch (err) {
    console.warn('Backend churches sync notice:', err);
  }
  return cachedChurches;
};

// Auto-trigger sync on import in browser
if (typeof window !== 'undefined' && !hasFetchedChurches) {
  syncChurchesFromBackend();
}

export const getChurches = (): Church[] => {
  if (!hasFetchedChurches && typeof window !== 'undefined') {
    syncChurchesFromBackend();
  }
  return [...cachedChurches];
};

export const saveChurch = async (church: Church): Promise<Church> => {
  cachedChurches = [church, ...cachedChurches.filter(c => c.id !== church.id)];
  if (typeof window !== 'undefined') {
    localStorage.setItem('pathfinder_churches', JSON.stringify(cachedChurches));
    window.dispatchEvent(new CustomEvent(CHURCHES_SYNC_EVENT, { detail: cachedChurches }));
  }

  try {
    const created = await api<Church>('/churches', {
      method: 'POST',
      body: JSON.stringify(church),
    });
    if (created && created.id) {
      cachedChurches = [created, ...cachedChurches.filter(c => c.id !== created.id && c.id !== church.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathfinder_churches', JSON.stringify(cachedChurches));
        window.dispatchEvent(new CustomEvent(CHURCHES_SYNC_EVENT, { detail: cachedChurches }));
      }
      return created;
    }
  } catch (err) {
    console.warn('Backend church save notice (persisted locally):', err);
  }
  return church;
};

export const updateChurch = async (church: Church): Promise<Church> => {
  const idx = cachedChurches.findIndex(c => c.id === church.id);
  if (idx !== -1) {
    cachedChurches[idx] = { ...cachedChurches[idx], ...church };
  } else {
    cachedChurches.push(church);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('pathfinder_churches', JSON.stringify(cachedChurches));
    window.dispatchEvent(new CustomEvent(CHURCHES_SYNC_EVENT, { detail: cachedChurches }));
  }

  try {
    const updated = await api<Church>(`/churches/${church.id}`, {
      method: 'PUT',
      body: JSON.stringify(church),
    });
    if (updated && idx !== -1) {
      cachedChurches[idx] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pathfinder_churches', JSON.stringify(cachedChurches));
      }
    }
    return updated || church;
  } catch (err) {
    console.warn(`Backend church update notice for ${church.id}:`, err);
    return church;
  }
};

export const deleteChurch = async (id: string): Promise<void> => {
  cachedChurches = cachedChurches.filter(c => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('pathfinder_churches', JSON.stringify(cachedChurches));
    window.dispatchEvent(new CustomEvent(CHURCHES_SYNC_EVENT, { detail: cachedChurches }));
  }

  try {
    await api(`/churches/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`Backend church delete notice for ${id}:`, err);
  }
};

// -------------------------------------------------------------
// Church Members API Operations (MySQL backed)
// -------------------------------------------------------------

export const syncChurchMembersFromBackend = async (isChurchPortal = false): Promise<ChurchMember[]> => {
  try {
    const endpoint = isChurchPortal ? '/church-portal/members' : '/church-members';
    const data = await api<ChurchMember[]>(endpoint);
    if (Array.isArray(data)) {
      cachedMembers = data;
      hasFetchedMembers = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CHURCH_MEMBERS_SYNC_EVENT, { detail: data }));
      }
      return data;
    }
  } catch (err) {
    console.warn('Backend church members sync notice:', err);
  }
  return cachedMembers;
};

export const getChurchMembers = (churchId?: string): ChurchMember[] => {
  if (!hasFetchedMembers && typeof window !== 'undefined') {
    syncChurchMembersFromBackend(!!churchId);
  }
  if (!churchId) {
    return [...cachedMembers];
  }
  return cachedMembers.filter(m => m.churchId === churchId);
};

export const saveChurchMember = async (member: Partial<ChurchMember>, _notify?: boolean): Promise<ChurchMember> => {
  try {
    const created = await api<ChurchMember>('/church-portal/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
    cachedMembers = [created, ...cachedMembers.filter(m => m.id !== created.id)];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHURCH_MEMBERS_SYNC_EVENT, { detail: cachedMembers }));
    }
    return created;
  } catch (err) {
    console.error('Failed to save church member to backend:', err);
    throw err;
  }
};

export const updateChurchMember = async (
  member: Partial<ChurchMember> & { id: string },
  _notify?: boolean
): Promise<ChurchMember> => {
  const idx = cachedMembers.findIndex(m => m.id === member.id);
  if (idx !== -1) {
    cachedMembers[idx] = { ...cachedMembers[idx], ...member } as ChurchMember;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHURCH_MEMBERS_SYNC_EVENT, { detail: cachedMembers }));
    }
  }

  try {
    const updated = await api<ChurchMember>(`/church-portal/members/${member.id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
    if (updated && idx !== -1) {
      cachedMembers[idx] = updated;
    }
    return updated;
  } catch (err) {
    console.error(`Failed to update member ${member.id} on backend:`, err);
    throw err;
  }
};

export const deleteChurchMember = async (id: string, _notify?: boolean): Promise<void> => {
  cachedMembers = cachedMembers.filter(m => m.id !== id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHURCH_MEMBERS_SYNC_EVENT, { detail: cachedMembers }));
  }

  try {
    await api(`/church-portal/members/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error(`Failed to delete member ${id} on backend:`, err);
    throw err;
  }
};

// -------------------------------------------------------------
// Church Applications Intake Operations (MySQL backed via /api/church-portal/applications)
// -------------------------------------------------------------

let cachedChurchApplications: Registration[] = [];
let hasFetchedChurchApplications = false;

export const CHURCH_APPLICATIONS_SYNC_EVENT = 'pathfinder:church_applications_sync';

export const syncChurchApplicationsFromBackend = async (): Promise<Registration[]> => {
  try {
    const data = await api<Registration[]>('/church-portal/applications');
    if (Array.isArray(data)) {
      cachedChurchApplications = data;
      hasFetchedChurchApplications = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CHURCH_APPLICATIONS_SYNC_EVENT, { detail: data }));
      }
      return data;
    }
  } catch (err) {
    console.warn('Backend church applications sync notice:', err);
  }
  return cachedChurchApplications;
};

export const getChurchApplications = (): Registration[] => {
  if (!hasFetchedChurchApplications && typeof window !== 'undefined') {
    syncChurchApplicationsFromBackend();
  }
  return [...cachedChurchApplications];
};

export const updateChurchApplicationStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<void> => {
  const idx = cachedChurchApplications.findIndex(a => a.id === id);
  if (idx !== -1) {
    cachedChurchApplications[idx] = {
      ...cachedChurchApplications[idx],
      status,
      notes: notes || cachedChurchApplications[idx].notes,
      reviewedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CHURCH_APPLICATIONS_SYNC_EVENT, { detail: cachedChurchApplications }));
    }
  }

  try {
    await api(`/church-portal/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  } catch (err) {
    console.error(`Failed to update application ${id}:`, err);
  }
};

export const enrollChurchApplication = async (
  id: string,
  application?: Registration
): Promise<{ ok: boolean; member?: ChurchMember }> => {
  try {
    const res = await api<{ ok: boolean; member: ChurchMember }>(`/church-portal/applications/${id}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ application }),
    });

    if (res && res.member) {
      cachedMembers = [res.member, ...cachedMembers.filter(m => m.id !== res.member.id)];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CHURCH_MEMBERS_SYNC_EVENT, { detail: cachedMembers }));
      }
    }

    const appIdx = cachedChurchApplications.findIndex(a => a.id === id);
    if (appIdx !== -1) {
      cachedChurchApplications[appIdx] = {
        ...cachedChurchApplications[appIdx],
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        notes: 'Approved & enrolled into church roster',
      };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CHURCH_APPLICATIONS_SYNC_EVENT, { detail: cachedChurchApplications }));
      }
    }

    return res;
  } catch (err) {
    console.error(`Failed to enroll application ${id}:`, err);
    throw err;
  }
};

