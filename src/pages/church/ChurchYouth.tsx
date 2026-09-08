import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Flame,
    Users,
    GraduationCap,
    Award,
    Search,
    UserPlus,
    RotateCcw,
    Edit,
    Trash2,
    Phone,
    Mail,
    Inbox,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import {
    getChurchMembers,
    syncChurchMembersFromBackend,
    updateChurchMember,
    deleteChurchMember,
    CHURCH_MEMBERS_SYNC_EVENT,
    getChurchApplications,
    syncChurchApplicationsFromBackend,
    CHURCH_APPLICATIONS_SYNC_EVENT,
} from '@/lib/churches';
import { ChurchMember } from '@/types/church';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const YOUTH_CATEGORIES = ['All', 'Senior Youth', 'Master Guide', 'Ambassador'] as const;

const ChurchYouth = () => {
    const { church } = useChurchAuth();
    const [members, setMembers] = useState<ChurchMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [pendingYouthAppsCount, setPendingYouthAppsCount] = useState(0);

    const loadData = () => {
        if (church?.id) {
            const allMembers = getChurchMembers(church.id);
            setMembers(allMembers);
        }
    };

    useEffect(() => {
        loadData();
        if (church?.id) {
            syncChurchMembersFromBackend(true).then((fresh) => {
                if (fresh) setMembers(fresh.filter(m => m.churchId === church.id));
            });
        }

        const handleSync = () => loadData();
        window.addEventListener(CHURCH_MEMBERS_SYNC_EVENT, handleSync);
        return () => window.removeEventListener(CHURCH_MEMBERS_SYNC_EVENT, handleSync);
    }, [church?.id]);

    useEffect(() => {
        const updateApps = () => {
            const apps = getChurchApplications();
            const youthPending = apps.filter(
                a => a.status === 'pending' &&
                (a.membership?.membershipCategory === 'Senior Youth' ||
                 a.membership?.membershipCategory === 'Master Guide' ||
                 (a.applicant?.age && a.applicant.age >= 16))
            ).length;
            setPendingYouthAppsCount(youthPending);
        };
        updateApps();
        syncChurchApplicationsFromBackend().then(() => updateApps());
        window.addEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, updateApps);
        return () => window.removeEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, updateApps);
    }, []);

    // Youth members: either category is Senior Youth or Master Guide, or pathfinderClass is Ambassador / Master Guide
    const youthMembers = useMemo(() => {
        return members.filter((m) => {
            const cat = m.membershipCategory;
            const cls = m.pathfinderClass;
            return cat === 'Senior Youth' || cat === 'Master Guide' || cls === 'Ambassador' || cls === 'Master Guide';
        });
    }, [members]);

    // Filtered list
    const filteredYouth = useMemo(() => {
        return youthMembers.filter((m) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                m.firstName.toLowerCase().includes(query) ||
                m.lastName.toLowerCase().includes(query) ||
                m.phone.includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.pathfinderClass.toLowerCase().includes(query);

            const matchesCategory =
                categoryFilter === 'All' ||
                (categoryFilter === 'Ambassador' ? m.pathfinderClass === 'Ambassador' : m.membershipCategory === categoryFilter);

            const matchesStatus =
                statusFilter === 'all' || m.status === statusFilter;

            const matchesGender =
                genderFilter === 'all' || m.gender.toLowerCase() === genderFilter.toLowerCase();

            return matchesSearch && matchesCategory && matchesStatus && matchesGender;
        });
    }, [youthMembers, searchQuery, categoryFilter, statusFilter, genderFilter]);

    // KPI stats
    const stats = useMemo(() => {
        const total = youthMembers.length;
        const active = youthMembers.filter(m => m.status === 'active').length;
        const seniorYouth = youthMembers.filter(m => m.membershipCategory === 'Senior Youth').length;
        const masterGuides = youthMembers.filter(m => m.membershipCategory === 'Master Guide' || m.pathfinderClass === 'Master Guide').length;
        const ambassadors = youthMembers.filter(m => m.pathfinderClass === 'Ambassador').length;

        return { total, active, seniorYouth, masterGuides, ambassadors };
    }, [youthMembers]);

    const handleToggleStatus = async (member: ChurchMember) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        try {
            await updateChurchMember({ id: member.id, status: newStatus }, true);
            toast.success(`${member.firstName}'s status changed to ${newStatus}`);
        } catch {
            toast.error('Failed to update member status');
        }
    };

    const handleDelete = async (memberId: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from church records?`)) return;
        try {
            await deleteChurchMember(memberId, true);
            toast.success(`${name} has been removed`);
        } catch {
            toast.error('Failed to remove member');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('All');
        setStatusFilter('all');
        setGenderFilter('all');
    };

    const hasFilters = searchQuery || categoryFilter !== 'All' || statusFilter !== 'all' || genderFilter !== 'all';

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full bg-slate-50/50">
            {/* Header */}
            <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-5 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                <Flame className="h-6 w-6 text-amber-500 fill-amber-500/20" />
                                Youth Ministry Management
                            </h1>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
                                Senior Youth & Leaders
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage Adventist Youth Society (AY), Ambassadors, Senior Youth, and Master Guides for {church?.name || 'Local Church'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {pendingYouthAppsCount > 0 && (
                            <Button asChild size="sm" variant="outline" className="border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100">
                                <Link to="/church/applications">
                                    <Inbox className="h-4 w-4 mr-1.5 text-amber-600" />
                                    {pendingYouthAppsCount} Pending Youth Apps
                                </Link>
                            </Button>
                        )}
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-xs">
                            <Link to="/church/members/add">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Enroll Youth Member
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full space-y-6">
                {/* KPI Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Youth</span>
                            <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-foreground mt-2">{stats.total}</p>
                        <p className="text-xs text-slate-500 mt-1">{stats.active} active • {stats.total - stats.active} inactive</p>
                    </div>

                    <div className="rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50/50 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Senior Youth (AY)</span>
                            <Flame className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-amber-950 mt-2">{stats.seniorYouth}</p>
                        <p className="text-xs text-amber-700/80 mt-1">Ages 16+ active society</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/50 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Master Guides</span>
                            <GraduationCap className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-emerald-950 mt-2">{stats.masterGuides}</p>
                        <p className="text-xs text-emerald-700/80 mt-1">Certified ministry leaders</p>
                    </div>

                    <div className="rounded-xl border border-indigo-200/80 bg-linear-to-br from-indigo-50/50 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Ambassadors</span>
                            <Award className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-indigo-950 mt-2">{stats.ambassadors}</p>
                        <p className="text-xs text-indigo-700/80 mt-1">Ages 16-21 transition rank</p>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search youth by name, phone, email, or class..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 text-xs bg-slate-50/60 focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-10 text-xs w-[140px] bg-slate-50/60">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YOUTH_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 text-xs w-[120px] bg-slate-50/60">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All Status</SelectItem>
                                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                                    <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="h-10 text-xs w-[120px] bg-slate-50/60">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All Genders</SelectItem>
                                    <SelectItem value="Male" className="text-xs">Male</SelectItem>
                                    <SelectItem value="Female" className="text-xs">Female</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 text-xs text-muted-foreground">
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Youth Member List */}
                {filteredYouth.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-4 py-3.5">Youth Member</th>
                                        <th className="px-4 py-3.5">Category & Class</th>
                                        <th className="px-4 py-3.5">Contact Details</th>
                                        <th className="px-4 py-3.5">Emergency / Guardian</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredYouth.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-heading font-bold flex items-center justify-center shrink-0">
                                                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-foreground text-sm block">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {member.gender} • Joined {member.dateJoined || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'font-semibold text-[11px]',
                                                            member.membershipCategory === 'Master Guide'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                                : 'bg-amber-50 text-amber-800 border-amber-300'
                                                        )}
                                                    >
                                                        {member.membershipCategory}
                                                    </Badge>
                                                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                                        <Shield className="h-3 w-3 text-primary" />
                                                        {member.pathfinderClass || 'Senior Youth Member'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="space-y-1">
                                                    {member.phone ? (
                                                        <p className="flex items-center gap-1.5 text-foreground font-medium">
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            {member.phone}
                                                        </p>
                                                    ) : (
                                                        <span className="text-slate-400">No phone</span>
                                                    )}
                                                    {member.email && (
                                                        <p className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            {member.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div>
                                                    <span className="font-medium text-foreground block">
                                                        {member.parentGuardianName || member.emergencyContact || 'Not recorded'}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {member.parentGuardianPhone || member.emergencyPhone || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    onClick={() => handleToggleStatus(member)}
                                                    className="group cursor-pointer flex items-center gap-1.5"
                                                    title="Click to toggle status"
                                                >
                                                    <span
                                                        className={cn(
                                                            'h-2 w-2 rounded-full',
                                                            member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                                                        )}
                                                    />
                                                    <span
                                                        className={cn(
                                                            'capitalize font-medium text-xs',
                                                            member.status === 'active' ? 'text-emerald-700' : 'text-slate-500'
                                                        )}
                                                    >
                                                        {member.status}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <Link to={`/church/members/edit/${member.id}`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <Flame className="h-12 w-12 text-amber-400/80 mx-auto mb-3" />
                        <h3 className="font-heading text-lg font-bold text-foreground">No Youth Members Found</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                            {hasFilters
                                ? 'No youth members match your current filters. Try resetting or adjusting your search parameters.'
                                : 'Your church has not enrolled any Senior Youth, Ambassadors, or Master Guides yet.'}
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {hasFilters ? (
                                <Button variant="outline" size="sm" onClick={clearFilters}>
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="sm">
                                        <Link to="/church/members/add">
                                            <UserPlus className="h-4 w-4 mr-1.5" />
                                            Enroll First Youth Member
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/church/applications">
                                            <Inbox className="h-4 w-4 mr-1.5" />
                                            Check Received Applications
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChurchYouth;
