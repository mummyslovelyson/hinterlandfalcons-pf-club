import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  getRegistrations,
  saveRegistration,
  updateRegistration,
  deleteRegistration,
  generateId,
  calculateAge,
  syncRegistrationsFromBackend,
} from '@/lib/registrations';
import { getChurches, syncChurchesFromBackend } from '@/lib/churches';
import {
  Registration,
  PATHFINDER_CLASSES,
  MEMBERSHIP_CATEGORIES,
} from '@/types/registration';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface MemberFormData {
  fullName: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  address: string;
  school: string;
  grade: string;
  schoolType: string;
  church: string;
  preferredClubName: string;
  membershipCategory: string;
  completedClasses: string[];
  honorsEarned: string;
  hasFullDressUniform: boolean;
  hasFullFieldUniform: boolean;
  wasPreviousPathfinder: boolean;
  previousClubName: string;
  guardianFullName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianOccupation: string;
  guardianIsMasterGuide: boolean;
  notes: string;
}

const DEFAULT_FORM_DATA: MemberFormData = {
  fullName: '',
  dateOfBirth: '2012-05-15',
  age: 14,
  phone: '',
  address: 'Santasi, Kumasi',
  school: '',
  grade: '',
  schoolType: 'Public',
  church: 'Santasi SDA Church',
  preferredClubName: 'Hinterland Falcons Pathfinder Club',
  membershipCategory: 'Pathfinder',
  completedClasses: ['Friend'],
  honorsEarned: '',
  hasFullDressUniform: false,
  hasFullFieldUniform: true,
  wasPreviousPathfinder: false,
  previousClubName: '',
  guardianFullName: '',
  guardianRelationship: 'Parent',
  guardianPhone: '',
  guardianOccupation: '',
  guardianIsMasterGuide: false,
  notes: '',
};

const Members = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedChurch, setSelectedChurch] = useState<string>('all');

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Registration | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Registration | null>(null);
  const [memberToView, setMemberToView] = useState<Registration | null>(null);

  // Form tab & data
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'church' | 'guardian'>('personal');
  const [formData, setFormData] = useState<MemberFormData>(DEFAULT_FORM_DATA);

  // Available churches from database
  const [availableChurches, setAvailableChurches] = useState<string[]>([]);

  const loadMembers = () => {
    const data = getRegistrations();
    setRegistrations(data.filter((r) => r.status === 'approved'));
    syncRegistrationsFromBackend().then((fresh) => {
      if (fresh) {
        setRegistrations(fresh.filter((r) => r.status === 'approved'));
      }
    });
  };

  useEffect(() => {
    loadMembers();

    // Load available churches from MySQL
    const churches = getChurches();
    if (churches.length > 0) {
      setAvailableChurches(churches.map((c) => c.name));
    }
    syncChurchesFromBackend().then((backendList) => {
      if (backendList && backendList.length > 0) {
        setAvailableChurches(backendList.map((c) => c.name));
      }
    });
  }, []);

  // Distinct constituent churches in current roster
  const rosterChurches = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      if (r.applicant.church) set.add(r.applicant.church);
    });
    return Array.from(set);
  }, [registrations]);

  // Metrics
  const totalMembers = registrations.length;
  const uniformReadyCount = registrations.filter((r) => r.membership?.hasFullDressUniform).length;
  const uniformRate = totalMembers > 0 ? Math.round((uniformReadyCount / totalMembers) * 100) : 0;
  const pathfinderCount = registrations.filter(
    (r) => r.membership?.membershipCategory === 'Pathfinder' || !r.membership?.membershipCategory
  ).length;
  const seniorLeaderCount = registrations.filter(
    (r) => r.membership?.membershipCategory === 'Senior Youth' || r.membership?.membershipCategory === 'Master Guide'
  ).length;

  // Filtered members
  const filteredMembers = useMemo(() => {
    return registrations.filter((reg) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        reg.applicant.fullName.toLowerCase().includes(q) ||
        reg.applicant.church.toLowerCase().includes(q) ||
        reg.guardian.fullName.toLowerCase().includes(q) ||
        (reg.applicant.school || '').toLowerCase().includes(q) ||
        (reg.id || '').toLowerCase().includes(q) ||
        (reg.membership.membershipCategory || '').toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || (reg.membership?.membershipCategory || 'Pathfinder') === selectedCategory;
      const matchesClass = selectedClass === 'all' || (Array.isArray(reg.membership?.completedClasses) && reg.membership.completedClasses.includes(selectedClass));
      const matchesChurch = selectedChurch === 'all' || reg.applicant?.church === selectedChurch;

      return matchesSearch && matchesCategory && matchesClass && matchesChurch;
    });
  }, [registrations, searchQuery, selectedCategory, selectedClass, selectedChurch]);

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'dateOfBirth' && value) {
        const computedAge = calculateAge(value);
        if (!isNaN(computedAge) && computedAge >= 0) {
          updated.age = computedAge;
        }
      }
      return updated;
    });
  };

  const toggleClass = (className: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.completedClasses) ? prev.completedClasses : [];
      const exists = current.includes(className);
      const updated = exists
        ? current.filter((c) => c !== className)
        : [...current, className];
      return { ...prev, completedClasses: updated };
    });
  };

  const openAddDialog = () => {
    setFormData(DEFAULT_FORM_DATA);
    setActiveFormTab('personal');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (member: Registration) => {
    setMemberToEdit(member);
    setFormData({
      fullName: member.applicant.fullName || '',
      dateOfBirth: member.applicant.dateOfBirth || '',
      age: member.applicant.age || calculateAge(member.applicant.dateOfBirth || ''),
      phone: member.applicant.phone || '',
      address: member.applicant.address || '',
      school: member.applicant.school || '',
      grade: member.applicant.grade || '',
      schoolType: member.applicant.schoolType || 'Public',
      church: member.applicant.church || 'Santasi SDA Church',
      preferredClubName: member.applicant.preferredClubName || 'Hinterland Falcons Pathfinder Club',
      membershipCategory: member.membership.membershipCategory || 'Pathfinder',
      completedClasses: member.membership.completedClasses || ['Friend'],
      honorsEarned: member.membership.honorsEarned || '',
      hasFullDressUniform: member.membership.hasFullDressUniform ?? false,
      hasFullFieldUniform: member.membership.hasFullFieldUniform ?? true,
      wasPreviousPathfinder: member.membership.wasPreviousPathfinder ?? false,
      previousClubName: member.membership.previousClubName || '',
      guardianFullName: member.guardian.fullName || '',
      guardianRelationship: member.guardian.relationship || 'Parent',
      guardianPhone: member.guardian.phone || '',
      guardianOccupation: member.guardian.occupation || '',
      guardianIsMasterGuide: member.guardian.isMasterGuide ?? false,
      notes: member.notes || '',
    });
    setActiveFormTab('personal');
    setIsEditDialogOpen(true);
  };

  const handleSaveNewMember = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Please provide member full name');
      setActiveFormTab('personal');
      return;
    }
    if (!formData.church.trim()) {
      toast.error('Please assign a constituent church');
      setActiveFormTab('church');
      return;
    }
    if (!formData.guardianFullName.trim() || !formData.guardianPhone.trim()) {
      toast.error('Please provide guardian contact details');
      setActiveFormTab('guardian');
      return;
    }

    const newId = generateId();
    const newMember: Registration = {
      id: newId,
      applicant: {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age) || calculateAge(formData.dateOfBirth),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        school: formData.school.trim(),
        grade: formData.grade.trim(),
        schoolType: formData.schoolType,
        church: formData.church.trim(),
        preferredClubName: formData.preferredClubName.trim(),
      },
      membership: {
        confirmJoining: true,
        agreesToParticipate: true,
        wasPreviousPathfinder: formData.wasPreviousPathfinder,
        previousClubName: formData.previousClubName.trim(),
        completedClasses: formData.completedClasses.length > 0 ? formData.completedClasses : ['Friend'],
        honorsEarned: formData.honorsEarned.trim(),
        hasFullDressUniform: formData.hasFullDressUniform,
        hasFullFieldUniform: formData.hasFullFieldUniform,
        membershipCategory: formData.membershipCategory,
      },
      guardian: {
        fullName: formData.guardianFullName.trim(),
        relationship: formData.guardianRelationship.trim(),
        phone: formData.guardianPhone.trim(),
        occupation: formData.guardianOccupation.trim(),
        isMasterGuide: formData.guardianIsMasterGuide,
        priorInvolvement: '',
        areasOfAssistance: [],
      },
      consent: {
        acknowledgesResponsibility: true,
        waivesClaims: true,
        agreesToCooperate: true,
        signature: formData.guardianFullName.trim(),
        signatureDate: new Date().toISOString().split('T')[0],
      },
      status: 'approved',
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin (Manual Entry)',
      notes: formData.notes?.trim() || undefined,
    };

    try {
      await saveRegistration(newMember);
      loadMembers();
      setIsAddDialogOpen(false);
      toast.success(`Member ${newMember.applicant.fullName} enrolled successfully!`);
    } catch (err) {
      console.error('Failed to enroll member:', err);
      const message = err instanceof Error ? err.message : 'Failed to enroll member. Please try again.';
      toast.error(message);
    }
  };

  const handleUpdateMember = async () => {
    if (!memberToEdit) return;

    if (!formData.fullName.trim()) {
      toast.error('Please provide member full name');
      setActiveFormTab('personal');
      return;
    }

    const updates: Partial<Registration> = {
      applicant: {
        ...memberToEdit.applicant,
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        age: Number(formData.age) || calculateAge(formData.dateOfBirth),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        school: formData.school.trim(),
        grade: formData.grade.trim(),
        schoolType: formData.schoolType,
        church: formData.church.trim(),
        preferredClubName: formData.preferredClubName.trim(),
      },
      membership: {
        ...memberToEdit.membership,
        membershipCategory: formData.membershipCategory,
        completedClasses: formData.completedClasses,
        honorsEarned: formData.honorsEarned.trim(),
        hasFullDressUniform: formData.hasFullDressUniform,
        hasFullFieldUniform: formData.hasFullFieldUniform,
        wasPreviousPathfinder: formData.wasPreviousPathfinder,
        previousClubName: formData.previousClubName.trim(),
      },
      guardian: {
        ...memberToEdit.guardian,
        fullName: formData.guardianFullName.trim(),
        relationship: formData.guardianRelationship.trim(),
        phone: formData.guardianPhone.trim(),
        occupation: formData.guardianOccupation.trim(),
        isMasterGuide: formData.guardianIsMasterGuide,
      },
      notes: formData.notes?.trim() || undefined,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin (Updated)',
    };

    try {
      await updateRegistration(memberToEdit.id, updates);
      loadMembers();
      setIsEditDialogOpen(false);
      setMemberToEdit(null);
      toast.success(`Member ${formData.fullName} updated successfully!`);
    } catch (err) {
      console.error('Failed to update member:', err);
      const message = err instanceof Error ? err.message : 'Failed to update member. Please try again.';
      toast.error(message);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await deleteRegistration(memberToDelete.id);
      loadMembers();
      toast.success(`Member ${memberToDelete.applicant.fullName} removed from active roster`);
      setMemberToDelete(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
      const message = err instanceof Error ? err.message : 'Failed to remove member. Please try again.';
      toast.error(message);
    }
  };

  // Export Active Roster to CSV
  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      toast.error('No members match the current filter to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Full Name',
      'Date of Birth',
      'Age',
      'Contact Phone',
      'Residential Address',
      'School / Institution',
      'Home Church',
      'Club Unit',
      'Membership Category',
      'Progressive Classes',
      'Honors Earned',
      'Full Dress Uniform',
      'Field Uniform',
      'Guardian Name',
      'Guardian Relationship',
      'Guardian Phone',
      'Guardian Is Master Guide',
      'Enrolled Date',
      'Notes',
    ];

    const rows = filteredMembers.map((m) => [
      m.id,
      `"${m.applicant.fullName}"`,
      m.applicant.dateOfBirth,
      m.applicant.age,
      m.applicant.phone,
      `"${m.applicant.address}"`,
      `"${m.applicant.school || ''}"`,
      `"${m.applicant.church}"`,
      `"${m.applicant.preferredClubName}"`,
      m.membership.membershipCategory || 'Pathfinder',
      `"${(m.membership.completedClasses || []).join(', ')}"`,
      `"${m.membership.honorsEarned || ''}"`,
      m.membership.hasFullDressUniform ? 'Yes' : 'No',
      m.membership.hasFullFieldUniform ? 'Yes' : 'No',
      `"${m.guardian.fullName}"`,
      m.guardian.relationship,
      m.guardian.phone,
      m.guardian.isMasterGuide ? 'Yes' : 'No',
      m.submittedAt,
      `"${m.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Santasi_AYM_Active_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredMembers.length} active members to CSV`);
  };

  return (
    <>
      <AdminHeader
        title="Club Members Directory"
        subtitle="Add, edit, inspect, and maintain active member records across Santasi AYM District."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
        <div className="w-full max-w-7xl mx-auto space-y-6">

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Roster</span>
              <p className="text-2xl font-heading font-extrabold text-foreground mt-1">{totalMembers}</p>
              <p className="text-xs text-slate-500">Enrolled pathfinders</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Uniform Ready</span>
              <p className="text-2xl font-heading font-extrabold text-primary mt-1">{uniformRate}%</p>
              <p className="text-xs text-slate-500">{uniformReadyCount} fully equipped</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Junior & Teens</span>
              <p className="text-2xl font-heading font-extrabold text-foreground mt-1">{pathfinderCount}</p>
              <p className="text-xs text-slate-500">Pathfinder Cadre</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Senior & MG Leaders</span>
              <p className="text-2xl font-heading font-extrabold text-slate-700 mt-1">{seniorLeaderCount}</p>
              <p className="text-xs text-slate-500">AYM Leadership</p>
            </div>
          </div>

          {/* Header Controls & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search by name, church, guardian, or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 text-xs border-slate-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={openAddDialog}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9"
                >
                  + Add New Member
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="text-xs font-semibold border-slate-200 hover:bg-slate-50 hover:text-primary h-9"
                >
                  ↓ Export Roster (CSV)
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs font-semibold border-slate-200 h-9">
                  <Link to="/admin/attendance">
                    Roll Call →
                  </Link>
                </Button>
              </div>
            </div>

            {/* Filter Dropdowns & Category Tabs */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { value: 'all', label: 'All Cadres' },
                  ...MEMBERSHIP_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setSelectedCategory(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === tab.value
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                {/* Class Filter */}
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[145px] h-8 text-xs border-slate-200 bg-white">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {PATHFINDER_CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Church Filter */}
                {rosterChurches.length > 0 && (
                  <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                    <SelectTrigger className="w-[165px] h-8 text-xs border-slate-200 bg-white">
                      <SelectValue placeholder="All Churches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Churches</SelectItem>
                      {rosterChurches.map((church) => (
                        <SelectItem key={church} value={church}>
                          {church}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {(selectedCategory !== 'all' || selectedClass !== 'all' || selectedChurch !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedClass('all');
                      setSelectedChurch('all');
                      setSearchQuery('');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-primary px-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Members Table with Full CRUD Controls */}
          {filteredMembers.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Mobile Card List (visible on screens smaller than md) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredMembers.map((member) => {
                  const initials = member.applicant.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={member.id}
                      onClick={() => setMemberToView(member)}
                      className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                            <AvatarImage src={member.applicant.profileImage} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-heading font-bold text-foreground text-sm truncate block">
                              {member.applicant.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {member.id} • {member.applicant.age} yrs
                            </span>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 border-slate-200 text-slate-700 shrink-0">
                          {member.membership.membershipCategory || 'Pathfinder'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Church</p>
                          <p className="text-foreground font-medium truncate">{member.applicant.church}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Uniform</p>
                          {member.membership?.hasFullDressUniform ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Full Dress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              Incomplete
                            </span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Guardian</p>
                          <p className="text-foreground font-medium truncate">
                            {member.guardian.fullName} • <span className="font-mono text-slate-500">{member.guardian.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1">
                          {(member.membership?.completedClasses || []).map((cls) => (
                            <span key={cls} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                              {cls}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMemberToView(member);
                            }}
                            className="h-8 text-xs px-2.5 text-slate-700 border-slate-200 hover:text-primary hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Dossier
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(member);
                            }}
                            className="h-8 w-8 text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:bg-slate-100"
                            title="Edit Member"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMemberToDelete(member);
                            }}
                            className="h-8 w-8 text-destructive border-slate-200 hover:text-destructive hover:bg-red-50 hover:border-red-300"
                            title="Delete Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Full Table View (visible on md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Member Identity</th>
                      <th className="px-5 py-3.5">Age & Education</th>
                      <th className="px-5 py-3.5">Constituent Church</th>
                      <th className="px-5 py-3.5">Cadre & Classes</th>
                      <th className="px-5 py-3.5">Guardian Contact</th>
                      <th className="px-5 py-3.5">Uniform</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredMembers.map((member) => {
                      const initials = member.applicant.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={member.id}
                          onClick={() => setMemberToView(member)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-slate-200 flex-shrink-0">
                                <AvatarImage src={member.applicant.profileImage} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <span className="font-heading font-bold text-foreground hover:text-primary transition-colors text-left truncate block">
                                  {member.applicant.fullName}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {member.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-foreground font-medium text-xs">{member.applicant.age} yrs</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
                              {member.applicant.grade || member.applicant.school || 'N/A'}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-foreground font-medium text-xs">{member.applicant.church}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {member.applicant.preferredClubName}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 border-slate-200 text-slate-700">
                                {member.membership.membershipCategory || 'Pathfinder'}
                              </Badge>
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {(member.membership?.completedClasses || []).slice(0, 2).map((cls) => (
                                  <span key={cls} className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                                    {cls}
                                  </span>
                                ))}
                                {(member.membership?.completedClasses || []).length > 2 && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    +{(member.membership?.completedClasses || []).length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-foreground font-medium text-xs">{member.guardian.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{member.guardian.phone}</p>
                          </td>
                          <td className="px-5 py-4">
                            {member.membership?.hasFullDressUniform ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Full Dress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                Incomplete
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberToView(member);
                                }}
                                className="h-8 w-8 text-slate-700 border-slate-200 hover:text-primary hover:bg-slate-100"
                                title="View Member Dossier"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(member);
                                }}
                                className="h-8 w-8 text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:bg-slate-100"
                                title="Edit Member"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberToDelete(member);
                                }}
                                className="h-8 w-8 text-destructive border-slate-200 hover:text-destructive hover:bg-red-50 hover:border-red-300"
                                title="Delete Member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>Showing {filteredMembers.length} of {registrations.length} registered members</span>
                <span>Santasi AYM District Administration</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 font-heading font-extrabold text-sm">
                00
              </div>
              <h3 className="font-heading font-bold text-base text-foreground mb-1">
                No Matching Members Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No members found matching your search or filters. You can clear filters or enroll a member above.
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedClass('all');
                    setSelectedChurch('all');
                    setSearchQuery('');
                  }}
                  className="text-xs border-slate-200"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* ADD MEMBER MODAL */}
      {/* ========================================================= */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Add New Club Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Directly enroll a pathfinder into the Santasi AYM District roster with approved active status.
            </DialogDescription>
          </DialogHeader>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 pt-2">
            {[
              { id: 'personal', label: '1. Personal Info' },
              { id: 'church', label: '2. Church & Rank' },
              { id: 'guardian', label: '3. Guardian & Emergency' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormTab(tab.id as typeof activeFormTab)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeFormTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-3 text-sm space-y-4">
            {/* TAB 1: PERSONAL INFO */}
            {activeFormTab === 'personal' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">Member Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Samuel Kwaku Boateng"
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-xs font-semibold">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-xs font-semibold">Age (Calculated)</Label>
                    <Input
                      id="age"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Contact Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="024 123 4567"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">Residential Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. House No. 42, Santasi New Site"
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="school" className="text-xs font-semibold">School / Institution</Label>
                    <Input
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder="e.g. Santasi M/A Basic School"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="grade" className="text-xs font-semibold">Class / Grade</Label>
                    <Input
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      placeholder="e.g. JHS 2"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHURCH & RANK */}
            {activeFormTab === 'church' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="church" className="text-xs font-semibold">Constituent Church *</Label>
                    <select
                      id="church"
                      name="church"
                      value={formData.church}
                      onChange={handleInputChange}
                      className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs bg-white"
                    >
                      {availableChurches.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="preferredClubName" className="text-xs font-semibold">Club Unit Name</Label>
                    <Input
                      id="preferredClubName"
                      name="preferredClubName"
                      value={formData.preferredClubName}
                      onChange={handleInputChange}
                      placeholder="Hinterland Falcons Pathfinder Club"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="membershipCategory" className="text-xs font-semibold">Cadre Category</Label>
                  <select
                    id="membershipCategory"
                    name="membershipCategory"
                    value={formData.membershipCategory}
                    onChange={handleInputChange}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs bg-white"
                  >
                    {MEMBERSHIP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Completed Progressive Classes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PATHFINDER_CLASSES.map((cls) => {
                      const isChecked = (formData.completedClasses || []).includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className={`p-2 rounded-lg border text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                            isChecked
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span>{cls}</span>
                          <span className="text-[11px]">{isChecked ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="honorsEarned" className="text-xs font-semibold">Honors & Badges Earned (Optional)</Label>
                  <Input
                    id="honorsEarned"
                    name="honorsEarned"
                    value={formData.honorsEarned}
                    onChange={handleInputChange}
                    placeholder="e.g. First Aid, Camping, Knots"
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.hasFullDressUniform}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, hasFullDressUniform: !!checked }))
                      }
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Has Full Dress Regalia</p>
                      <p className="text-[11px] text-slate-500">Includes beret, scarf, sash, badges</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.hasFullFieldUniform}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, hasFullFieldUniform: !!checked }))
                      }
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Has Field T-Shirt</p>
                      <p className="text-[11px] text-slate-500">Club exercise & camp t-shirt</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: GUARDIAN & EMERGENCY */}
            {activeFormTab === 'guardian' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="guardianFullName" className="text-xs font-semibold">Guardian Full Name *</Label>
                    <Input
                      id="guardianFullName"
                      name="guardianFullName"
                      value={formData.guardianFullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Deaconess Mary Osei"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guardianRelationship" className="text-xs font-semibold">Relationship</Label>
                    <select
                      id="guardianRelationship"
                      name="guardianRelationship"
                      value={formData.guardianRelationship}
                      onChange={handleInputChange}
                      className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Grandparent">Grandparent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="guardianPhone" className="text-xs font-semibold">Guardian Phone *</Label>
                    <Input
                      id="guardianPhone"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      placeholder="024 456 7890"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guardianOccupation" className="text-xs font-semibold">Occupation</Label>
                    <Input
                      id="guardianOccupation"
                      name="guardianOccupation"
                      value={formData.guardianOccupation}
                      onChange={handleInputChange}
                      placeholder="e.g. Teacher, Trader, Civil Servant"
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <Checkbox
                    checked={formData.guardianIsMasterGuide}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, guardianIsMasterGuide: !!checked }))
                    }
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Guardian is an Invested Master Guide</p>
                    <p className="text-[11px] text-slate-500">Recognized leader within the Adventist Youth Ministries</p>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold">Administrative Remarks / Medical Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special dietary requirements, emergency allergies, drill exemptions..."
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
              className="text-xs border-slate-200"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {activeFormTab !== 'personal' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveFormTab(activeFormTab === 'guardian' ? 'church' : 'personal')
                  }
                  className="text-xs border-slate-200"
                >
                  ← Back
                </Button>
              )}
              {activeFormTab !== 'guardian' ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setActiveFormTab(activeFormTab === 'personal' ? 'church' : 'guardian')
                  }
                  className="text-xs bg-primary text-white"
                >
                  Next Step →
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveNewMember}
                  className="text-xs bg-primary text-white font-semibold"
                >
                  Save & Enroll Member
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* EDIT MEMBER MODAL */}
      {/* ========================================================= */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Edit Member Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update dossier, church affiliation, completed honors, or guardian contact info for {formData.fullName}.
            </DialogDescription>
          </DialogHeader>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 pt-2">
            {[
              { id: 'personal', label: '1. Personal Info' },
              { id: 'church', label: '2. Church & Rank' },
              { id: 'guardian', label: '3. Guardian & Emergency' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormTab(tab.id as typeof activeFormTab)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeFormTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-3 text-sm space-y-4">
            {/* TAB 1: PERSONAL INFO */}
            {activeFormTab === 'personal' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-fullName" className="text-xs font-semibold">Member Full Name *</Label>
                  <Input
                    id="edit-fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-dateOfBirth" className="text-xs font-semibold">Date of Birth</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-age" className="text-xs font-semibold">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="text-xs font-semibold">Phone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-address" className="text-xs font-semibold">Address</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="edit-school" className="text-xs font-semibold">School</Label>
                    <Input
                      id="edit-school"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-grade" className="text-xs font-semibold">Grade</Label>
                    <Input
                      id="edit-grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHURCH & RANK */}
            {activeFormTab === 'church' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-church" className="text-xs font-semibold">Constituent Church *</Label>
                    <select
                      id="edit-church"
                      name="church"
                      value={formData.church}
                      onChange={handleInputChange}
                      className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs bg-white"
                    >
                      {availableChurches.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-preferredClubName" className="text-xs font-semibold">Club Unit</Label>
                    <Input
                      id="edit-preferredClubName"
                      name="preferredClubName"
                      value={formData.preferredClubName}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-membershipCategory" className="text-xs font-semibold">Cadre Category</Label>
                  <select
                    id="edit-membershipCategory"
                    name="membershipCategory"
                    value={formData.membershipCategory}
                    onChange={handleInputChange}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs bg-white"
                  >
                    {MEMBERSHIP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Completed Progressive Classes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PATHFINDER_CLASSES.map((cls) => {
                      const isChecked = (formData.completedClasses || []).includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className={`p-2 rounded-lg border text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                            isChecked
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span>{cls}</span>
                          <span className="text-[11px]">{isChecked ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-honorsEarned" className="text-xs font-semibold">Honors & Badges Earned</Label>
                  <Input
                    id="edit-honorsEarned"
                    name="honorsEarned"
                    value={formData.honorsEarned}
                    onChange={handleInputChange}
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.hasFullDressUniform}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, hasFullDressUniform: !!checked }))
                      }
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Has Full Dress Regalia</p>
                      <p className="text-[11px] text-slate-500">Parade dress compliant</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      checked={formData.hasFullFieldUniform}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, hasFullFieldUniform: !!checked }))
                      }
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Has Field T-Shirt</p>
                      <p className="text-[11px] text-slate-500">Camp uniform active</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: GUARDIAN & EMERGENCY */}
            {activeFormTab === 'guardian' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-guardianFullName" className="text-xs font-semibold">Guardian Full Name *</Label>
                    <Input
                      id="edit-guardianFullName"
                      name="guardianFullName"
                      value={formData.guardianFullName}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-guardianRelationship" className="text-xs font-semibold">Relationship</Label>
                    <Input
                      id="edit-guardianRelationship"
                      name="guardianRelationship"
                      value={formData.guardianRelationship}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-guardianPhone" className="text-xs font-semibold">Guardian Phone *</Label>
                    <Input
                      id="edit-guardianPhone"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-guardianOccupation" className="text-xs font-semibold">Occupation</Label>
                    <Input
                      id="edit-guardianOccupation"
                      name="guardianOccupation"
                      value={formData.guardianOccupation}
                      onChange={handleInputChange}
                      className="h-9 text-xs border-slate-200"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <Checkbox
                    checked={formData.guardianIsMasterGuide}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, guardianIsMasterGuide: !!checked }))
                    }
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Guardian is an Invested Master Guide</p>
                    <p className="text-[11px] text-slate-500">AYM leadership cadre</p>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-notes" className="text-xs font-semibold">Administrative Remarks / Notes</Label>
                  <textarea
                    id="edit-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-md border border-slate-200 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs border-slate-200"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleUpdateMember}
                className="text-xs bg-primary text-white font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION ALERT DIALOG */}
      {/* ========================================================= */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-lg font-bold text-destructive">
              Remove Member from Club Roster?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to remove <span className="font-bold text-slate-900">{memberToDelete?.applicant.fullName}</span> ({memberToDelete?.id}) from the active roster?
              </p>
              <p className="text-slate-500">
                This action will delete the member record and purge their attendance ledger from the database.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========================================================= */}
      {/* VIEW MEMBER DOSSIER MODAL */}
      {/* ========================================================= */}
      <Dialog open={!!memberToView} onOpenChange={(open) => !open && setMemberToView(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white">
          {memberToView && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={memberToView.applicant.profileImage} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-sm">
                      {memberToView.applicant.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="font-heading text-lg font-bold text-foreground">
                      {memberToView.applicant.fullName}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {memberToView.id} • Enrolled {new Date(memberToView.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold">
                    Approved Active Member
                  </Badge>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    {memberToView.membership.membershipCategory || 'Pathfinder'}
                  </Badge>
                  <span className="text-slate-500 font-medium">
                    Age {memberToView.applicant.age} • {memberToView.applicant.grade || 'Student'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Church & Club */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
                      Congregation & Unit
                    </p>
                    <div className="space-y-1">
                      <p><span className="text-slate-400">Home Church:</span> <strong className="text-slate-900">{memberToView.applicant.church}</strong></p>
                      <p><span className="text-slate-400">Club Unit:</span> <span className="text-slate-800">{memberToView.applicant.preferredClubName}</span></p>
                      <p><span className="text-slate-400">Address:</span> <span className="text-slate-800">{memberToView.applicant.address}</span></p>
                      <p><span className="text-slate-400">Phone:</span> <span className="text-slate-800">{memberToView.applicant.phone || '—'}</span></p>
                    </div>
                  </div>

                  {/* Guardian & Emergency */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
                      Guardian & Emergency
                    </p>
                    <div className="space-y-1">
                      <p><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{memberToView.guardian.fullName}</strong></p>
                      <p><span className="text-slate-400">Relationship:</span> <span className="text-slate-800">{memberToView.guardian.relationship}</span></p>
                      <p>
                        <span className="text-slate-400">Phone:</span>{' '}
                        <a href={`tel:${memberToView.guardian.phone}`} className="text-primary font-mono font-bold hover:underline">
                          {memberToView.guardian.phone}
                        </a>
                      </p>
                      <p><span className="text-slate-400">Occupation:</span> <span className="text-slate-800">{memberToView.guardian.occupation || '—'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Progressive Ranks & Regalia */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
                    Progressive Classes & Regalia Readiness
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(memberToView.membership?.completedClasses || []).map((cls) => (
                      <span key={cls} className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-primary/10 text-primary">
                        {cls}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 pt-2 text-slate-600">
                    <span>Dress Regalia: <strong>{memberToView.membership.hasFullDressUniform ? '✓ Compliant' : '✕ Incomplete'}</strong></span>
                    <span>Field Shirt: <strong>{memberToView.membership.hasFullFieldUniform ? '✓ Equipped' : '✕ Missing'}</strong></span>
                  </div>
                </div>

                {/* Remarks / Notes */}
                {memberToView.notes && (
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-700 text-xs mb-1">Administrative Notes:</p>
                    <p className="text-slate-600 text-xs">{memberToView.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberToView(null)}
                  className="text-xs border-slate-200"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const m = memberToView;
                      setMemberToView(null);
                      openEditDialog(m);
                    }}
                    className="text-xs border-slate-200 hover:border-primary hover:text-primary"
                  >
                    Edit Record
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    asChild
                    className="text-xs bg-primary text-white"
                  >
                    <Link to={`/admin/members/${memberToView.id}`}>
                      Full Dossier Page →
                    </Link>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Members;
