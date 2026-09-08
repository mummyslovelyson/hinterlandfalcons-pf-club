export const FABRIC_COLORS = [
    { id: 'white', label: 'White', description: 'Top fabric', hex: '#FFFFFF', border: '#e2e8f0' },
    { id: 'khaki', label: 'Khaki', description: 'Top fabric', hex: '#C3B091', border: '#C3B091' },
    { id: 'green', label: 'Green', description: 'Bottom fabric', hex: '#2E5A1E', border: '#2E5A1E' },
] as const;

export const YARD_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10] as const;

export const GENDER_OPTIONS = ['Male', 'Female'] as const;

export interface FabricOrder {
    colorId: string;
    colorLabel: string;
    yards: number;
}

export interface UniformRequest {
    id: string;
    memberName: string;
    memberPhone: string;
    memberChurch: string;
    memberCategory: string;
    gender: string;
    fabrics: FabricOrder[];
    totalYards: number;
    specialNotes: string;
    status: 'pending' | 'processing' | 'ready' | 'delivered';
    submittedAt: string;
    processedAt?: string;
    processedBy?: string;
    adminNotes?: string;
}
