export interface ApplicantInfo {
  fullName: string;
  phone: string;
  address: string;
  school: string;
  grade: string;
  dateOfBirth: string;
  age: number;
  church: string;
  preferredClubName: string;
  profileImage?: string;
  schoolType: string;
}

export interface MembershipInfo {
  confirmJoining: boolean;
  agreesToParticipate: boolean;
  wasPreviousPathfinder: boolean;
  previousClubName: string;
  completedClasses: string[];
  honorsEarned: string;
  hasFullDressUniform: boolean;
  hasFullFieldUniform: boolean;
}

export interface GuardianInfo {
  fullName: string;
  relationship: string;
  phone: string;
  occupation: string;
  isMasterGuide: boolean;
  priorInvolvement: string;
  areasOfAssistance: string[];
}

export interface ConsentInfo {
  acknowledgesResponsibility: boolean;
  waivesClaims: boolean;
  agreesToCooperate: boolean;
  signature: string;
  signatureDate: string;
}

export interface Registration {
  id: string;
  applicant: ApplicantInfo;
  membership: MembershipInfo;
  guardian: GuardianInfo;
  consent: ConsentInfo;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export const PATHFINDER_CLASSES = [
  'Friend',
  'Companion',
  'Explorer',
  'Ranger',
  'Voyager',
  'Guide',
] as const;

export const ASSISTANCE_AREAS = [
  'Teaching',
  'Mentoring',
  'Logistics',
  'Leadership Support',
  'Transportation',
  'Camping Coordination',
  'First Aid',
  'Music & Worship',
  'Crafts & Activities',
  'Administration',
] as const;
