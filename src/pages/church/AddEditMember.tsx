import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import { PATHFINDER_CLASSES, MEMBERSHIP_CATEGORIES_CHURCH } from '@/types/church';
import type { ChurchMember } from '@/types/church';
import {
    ArrowLeft,
    Save,
    UserPlus,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Shield,
    Heart,
} from 'lucide-react';
import { toast } from 'sonner';

import { getChurchMembers, saveChurchMember, updateChurchMember } from '@/lib/churches';

const AddEditMember = () => {
    const { church } = useChurchAuth();
    const navigate = useNavigate();
    const { memberId } = useParams();
    const isEditing = !!memberId;

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '' as 'Male' | 'Female' | '',
        phone: '',
        email: '',
        address: '',
        membershipCategory: '' as 'Pathfinder' | 'Senior Youth' | 'Master Guide' | '',
        pathfinderClass: '',
        parentGuardianName: '',
        parentGuardianPhone: '',
        emergencyContact: '',
        emergencyPhone: '',
        dateJoined: new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'inactive',
        specialNotes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isEditing && memberId) {
            const allMembers = getChurchMembers();
            const member = allMembers.find(m => m.id === memberId);
            if (member) {
                setForm({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    dateOfBirth: member.dateOfBirth,
                    gender: member.gender,
                    phone: member.phone,
                    email: member.email,
                    address: member.address,
                    membershipCategory: member.membershipCategory,
                    pathfinderClass: member.pathfinderClass,
                    parentGuardianName: member.parentGuardianName,
                    parentGuardianPhone: member.parentGuardianPhone,
                    emergencyContact: member.emergencyContact,
                    emergencyPhone: member.emergencyPhone,
                    dateJoined: member.dateJoined,
                    status: member.status,
                    specialNotes: member.specialNotes,
                });
            } else {
                toast.error('Member not found');
                navigate('/church/members');
            }
        }
    }, [memberId, isEditing, navigate]);

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
        }
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.firstName.trim()) errs.firstName = 'First name is required';
        if (!form.lastName.trim()) errs.lastName = 'Last name is required';
        if (!form.gender) errs.gender = 'Gender is required';
        if (!form.membershipCategory) errs.membershipCategory = 'Category is required';
        if (!form.pathfinderClass) errs.pathfinderClass = 'Class is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !church) return;

        try {
            if (isEditing && memberId) {
                const allMembers = getChurchMembers();
                const current = allMembers.find(m => m.id === memberId);
                if (current) {
                    const updated: ChurchMember = {
                        ...current,
                        ...form,
                        gender: form.gender as 'Male' | 'Female',
                        membershipCategory: form.membershipCategory as 'Pathfinder' | 'Senior Youth' | 'Master Guide',
                        updatedAt: new Date().toISOString(),
                    };
                    await updateChurchMember(updated, true);
                    toast.success('Member updated successfully');
                }
            } else {
                const now = new Date().toISOString();
                const member: ChurchMember = {
                    id: `MEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    ...form,
                    gender: form.gender as 'Male' | 'Female',
                    membershipCategory: form.membershipCategory as 'Pathfinder' | 'Senior Youth' | 'Master Guide',
                    profilePhoto: '',
                    churchId: church.id,
                    createdAt: now,
                    updatedAt: now,
                };
                await saveChurchMember(member, true);
                toast.success('Member added successfully');
            }
            navigate('/church/members');
        } catch (err) {
            console.error('Failed to save church member:', err);
            const message = err instanceof Error ? err.message : 'Failed to save member. Please try again.';
            toast.error(message);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
            {/* Header */}
            <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-5 shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/church/members')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                                {isEditing ? 'Edit Member Profile' : 'Add New Member'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isEditing ? 'Update member information in church records' : 'Enroll and register a new member into the church congregation roster'}
                            </p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate('/church/members')} className="hidden sm:flex">
                        Cancel & Return
                    </Button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
                <form onSubmit={handleSubmit} className="w-full space-y-6 pb-16">
                    {/* Personal Information */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={e => updateField('firstName', e.target.value)}
                                    placeholder="Enter first name"
                                    className={errors.firstName ? 'border-destructive' : ''}
                                />
                                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={e => updateField('lastName', e.target.value)}
                                    placeholder="Enter last name"
                                    className={errors.lastName ? 'border-destructive' : ''}
                                />
                                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={form.dateOfBirth}
                                        onChange={e => updateField('dateOfBirth', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Gender <span className="text-destructive">*</span></Label>
                                <Select value={form.gender} onValueChange={v => updateField('gender', v)}>
                                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={form.phone}
                                        onChange={e => updateField('phone', e.target.value)}
                                        placeholder="0201234567"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={e => updateField('email', e.target.value)}
                                        placeholder="member@email.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="address">Residential Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        value={form.address}
                                        onChange={e => updateField('address', e.target.value)}
                                        placeholder="Enter residential address"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pathfinder Information */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Pathfinder Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            <div className="space-y-2">
                                <Label>Membership Category <span className="text-destructive">*</span></Label>
                                <Select value={form.membershipCategory} onValueChange={v => updateField('membershipCategory', v)}>
                                    <SelectTrigger className={errors.membershipCategory ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEMBERSHIP_CATEGORIES_CHURCH.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.membershipCategory && <p className="text-xs text-destructive">{errors.membershipCategory}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Pathfinder Class <span className="text-destructive">*</span></Label>
                                <Select value={form.pathfinderClass} onValueChange={v => updateField('pathfinderClass', v)}>
                                    <SelectTrigger className={errors.pathfinderClass ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PATHFINDER_CLASSES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.pathfinderClass && <p className="text-xs text-destructive">{errors.pathfinderClass}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateJoined">Date Joined</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="dateJoined"
                                        type="date"
                                        value={form.dateJoined}
                                        onChange={e => updateField('dateJoined', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={v => updateField('status', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Guardian & Emergency */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            Guardian & Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="guardianName">Parent/Guardian Name</Label>
                                <Input
                                    id="guardianName"
                                    value={form.parentGuardianName}
                                    onChange={e => updateField('parentGuardianName', e.target.value)}
                                    placeholder="Enter guardian name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                                <Input
                                    id="guardianPhone"
                                    value={form.parentGuardianPhone}
                                    onChange={e => updateField('parentGuardianPhone', e.target.value)}
                                    placeholder="0201234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                                <Input
                                    id="emergencyContact"
                                    value={form.emergencyContact}
                                    onChange={e => updateField('emergencyContact', e.target.value)}
                                    placeholder="Enter emergency contact name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                                <Input
                                    id="emergencyPhone"
                                    value={form.emergencyPhone}
                                    onChange={e => updateField('emergencyPhone', e.target.value)}
                                    placeholder="0201234567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
                        <h3 className="font-heading font-semibold text-foreground mb-4">Special Notes</h3>
                        <Textarea
                            value={form.specialNotes}
                            onChange={e => updateField('specialNotes', e.target.value)}
                            placeholder="Any special notes about this member (medical conditions, allergies, special diet, etc.)"
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 justify-end items-center pt-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/church/members')}>
                            Cancel
                        </Button>
                        <Button type="submit" className="gap-2 px-6">
                            {isEditing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            {isEditing ? 'Update Member' : 'Add Member'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddEditMember;
