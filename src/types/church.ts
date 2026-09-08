// Church and Church Member types

export interface ChurchMember {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    phone: string;
    email: string;
    address: string;
    membershipCategory: 'Pathfinder' | 'Senior Youth' | 'Master Guide';
    pathfinderClass: string;
    parentGuardianName: string;
    parentGuardianPhone: string;
    emergencyContact: string;
    emergencyPhone: string;
    dateJoined: string;
    status: 'active' | 'inactive';
    specialNotes: string;
    profilePhoto: string;
    churchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Church {
    id: string;
    name: string;
    pastorName: string;
    contactPhone: string;
    contactEmail: string;
    location: string;
    district: string;
    username: string;
    password: string;
    createdAt: string;
}

export const PATHFINDER_CLASSES = [
    'Friend',
    'Companion',
    'Explorer',
    'Ranger',
    'Voyager',
    'Guide',
    'Pioneer',
    'Pathfinder',
    'Ambassador',
    'Master Guide',
] as const;

export const MEMBER_STATUSES = ['active', 'inactive'] as const;

export const MEMBERSHIP_CATEGORIES_CHURCH = [
    'Pathfinder',
    'Senior Youth',
    'Master Guide',
] as const;
