import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import { PATHFINDER_CLASSES } from '@/types/church';
import type { ChurchMember } from '@/types/church';
import type { Registration } from '@/types/registration';
import { toast } from 'sonner';
import {
    getChurchMembers,
    syncChurchMembersFromBackend,
    CHURCH_MEMBERS_SYNC_EVENT,
    getChurchApplications,
    syncChurchApplicationsFromBackend,
    CHURCH_APPLICATIONS_SYNC_EVENT,
} from '@/lib/churches';
import { Flame, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChurchDashboard = () => {
    const { church } = useChurchAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [membersList, setMembersList] = useState<ChurchMember[]>([]);
    const [applicationsList, setApplicationsList] = useState<Registration[]>([]);
    const navigate = useNavigate();

    const refreshMembers = useCallback(() => {
        if (church) {
            setMembersList(getChurchMembers(church.id));
        }
    }, [church]);

    const refreshApplications = useCallback(() => {
        setApplicationsList(getChurchApplications());
    }, []);

    useEffect(() => {
        if (!church) return;
        syncChurchMembersFromBackend(true).then((data) => {
            if (Array.isArray(data)) {
                setMembersList(data.filter(m => m.churchId === church.id));
            }
        });
        refreshMembers();

        syncChurchApplicationsFromBackend().then((data) => {
            if (Array.isArray(data)) {
                setApplicationsList(data);
            }
        });
        refreshApplications();

        window.addEventListener(CHURCH_MEMBERS_SYNC_EVENT, refreshMembers);
        window.addEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, refreshApplications);
        return () => {
            window.removeEventListener(CHURCH_MEMBERS_SYNC_EVENT, refreshMembers);
            window.removeEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, refreshApplications);
        };
    }, [church, refreshMembers, refreshApplications]);

    const members = useMemo(() => {
        if (!church) return [];
        return membersList.length > 0 ? membersList : getChurchMembers(church.id);
    }, [church, membersList]);

    const applications = applicationsList;
    const pendingApps = useMemo(() => applications.filter(a => a.status === 'pending'), [applications]);

    const youthMembers = useMemo(() => {
        return members.filter(
            m => m.membershipCategory === 'Senior Youth' ||
                 m.membershipCategory === 'Master Guide' ||
                 m.pathfinderClass === 'Ambassador' ||
                 m.pathfinderClass === 'Master Guide'
        );
    }, [members]);

    const stats = useMemo(() => {
        const active = members.filter(m => m.status === 'active').length;
        const inactive = members.filter(m => m.status === 'inactive').length;
        const male = members.filter(m => m.gender === 'Male').length;
        const female = members.filter(m => m.gender === 'Female').length;
        const pathfinders = members.filter(m => m.membershipCategory === 'Pathfinder').length;
        const seniorYouth = members.filter(m => m.membershipCategory === 'Senior Youth').length;
        const masterGuides = members.filter(m => m.membershipCategory === 'Master Guide').length;
        const ambassadors = members.filter(m => m.pathfinderClass === 'Ambassador').length;

        // Class distribution
        const classDist: Record<string, number> = {};
        PATHFINDER_CLASSES.forEach(c => { classDist[c] = 0; });
        members.forEach(m => {
            if (m.pathfinderClass && classDist[m.pathfinderClass] !== undefined) {
                classDist[m.pathfinderClass]++;
            }
        });

        // Recent members (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentMembers = members.filter(m => new Date(m.createdAt) >= thirtyDaysAgo);

        return { active, inactive, male, female, pathfinders, seniorYouth, masterGuides, ambassadors, classDist, recentMembers };
    }, [members]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            navigate('/church/members');
            return;
        }
        navigate(`/church/members?search=${encodeURIComponent(query)}`);
        toast.info(`Filtering congregation records for "${query}"`);
    };

    return (
        <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/60 pb-12">
            {/* Header Banner with Sanctuary Background & Linear Gradient */}
            <div className="relative border-b border-slate-200 text-white px-4 sm:px-6 py-6 overflow-hidden bg-slate-900">
                <div
                    className="absolute inset-0 bg-cover bg-center -z-10 opacity-30"
                    style={{ backgroundImage: "url('/church-portal-bg.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#163f3c]/90 to-slate-950/95 -z-10" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full px-2 sm:px-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 bg-primary shadow-sm p-0.5">
                            <img src="/falcons-logo.png" alt="Logo" className="h-full w-full object-cover rounded-full" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-heading text-xl sm:text-2xl font-bold text-white truncate">
                                {church?.name || 'Santasi SDA Church'}
                            </h1>
                            <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                <span>{church?.location || 'Santasi, Kumasi'}</span>
                                <span className="text-slate-500">•</span>
                                <span>Pastor: {church?.pastorName || 'Assigned Minister'}</span>
                                <span className="text-slate-500">•</span>
                                <span>{church?.contactPhone || '+233 24 555 7890'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-semibold h-9 shadow-xs">
                            <Link to="/church/youth" className="flex items-center gap-1.5">
                                <Flame className="h-3.5 w-3.5 text-amber-400" />
                                Youth Ministry ({youthMembers.length})
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-semibold h-9 shadow-xs">
                            <Link to="/church/applications" className="flex items-center gap-1.5">
                                <Inbox className="h-3.5 w-3.5 text-slate-200" />
                                Applications
                                {pendingApps.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                        {pendingApps.length}
                                    </span>
                                )}
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 shadow-xs">
                            <Link to="/church/members/add">+ Add Member</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
                {/* Search Bar on Church Dashboard Overview */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Input
                                placeholder="Search congregation registry by name, rank, phone, or school..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 text-xs border-slate-200 w-full bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-10 px-5 w-full sm:w-auto shadow-xs"
                            >
                                Search Congregation
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/church/members')}
                                className="text-xs font-semibold border-slate-200 hover:bg-slate-50 h-10 px-4 w-full sm:w-auto"
                            >
                                Full Roster
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Congregation</span>
                        <p className="text-3xl font-heading font-extrabold text-foreground mt-1">{members.length}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{stats.active} active • {stats.inactive} inactive</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Junior Pathfinders</span>
                        <p className="text-3xl font-heading font-extrabold text-primary mt-1">{stats.pathfinders}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Classes Friend to Guide</p>
                    </div>
                    <div className="rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50/40 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Youth Department</span>
                            <Flame className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-amber-950 mt-1">{youthMembers.length}</p>
                        <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-amber-700/80">Senior Youth & Leaders</span>
                            <Link to="/church/youth" className="text-[11px] font-bold text-amber-800 hover:underline flex items-center">
                                Manage →
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/40 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Applications Intake</span>
                            <Inbox className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-emerald-950 mt-1">{pendingApps.length}</p>
                        <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-emerald-700/80">Pending ({applications.length} total)</span>
                            <Link to="/church/applications" className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center">
                                Review →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Incoming Member Applications Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <Inbox className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-foreground text-base flex items-center gap-2">
                                    Incoming Member Applications
                                    {pendingApps.length > 0 && (
                                        <Badge className="bg-amber-500 text-white font-bold text-xs">
                                            {pendingApps.length} Pending
                                        </Badge>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500">Candidates who submitted online registration for this local church</p>
                            </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="text-xs font-semibold border-slate-200">
                            <Link to="/church/applications">
                                View Applications Inbox ({applications.length}) →
                            </Link>
                        </Button>
                    </div>

                    {pendingApps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {pendingApps.slice(0, 3).map(app => {
                                const isYouth = app.membership?.membershipCategory === 'Senior Youth' || app.membership?.membershipCategory === 'Master Guide' || (app.applicant?.age && app.applicant.age >= 16);
                                return (
                                    <div key={app.id} className="rounded-lg border border-slate-200 hover:border-primary/40 p-3.5 bg-slate-50/40 hover:bg-white transition-all space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="font-bold text-foreground text-xs block">
                                                    {app.applicant?.fullName || 'Candidate'}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Age {app.applicant?.age || 'N/A'} • {app.applicant?.phone || 'No phone'}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-[10px] font-bold shrink-0',
                                                    isYouth
                                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                )}
                                            >
                                                {app.membership?.membershipCategory || 'Pathfinder'}
                                            </Badge>
                                        </div>

                                        <p className="text-[11px] text-slate-600 truncate">
                                            {app.applicant?.school || 'School unlisted'}
                                        </p>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(app.submittedAt).toLocaleDateString()}
                                            </span>
                                            <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary hover:text-white">
                                                <Link to="/church/applications">
                                                    Review & Enroll →
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-center">
                            <p className="text-xs text-slate-500">
                                No pending applications waiting. All received candidates have been processed.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Membership Category Breakdown */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                        <h3 className="font-heading font-bold text-foreground text-base mb-1">
                            Membership Cadres
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Distribution by Adventist Youth section</p>

                        <div className="space-y-4">
                            {[
                                { label: 'Pathfinder', count: stats.pathfinders, color: 'bg-primary' },
                                { label: 'Senior Youth', count: stats.seniorYouth, color: 'bg-slate-700' },
                                { label: 'Master Guide', count: stats.masterGuides, color: 'bg-amber-600' },
                            ].map(cat => (
                                <div key={cat.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-foreground">{cat.label}</span>
                                        <span className="text-xs font-heading font-extrabold text-foreground">{cat.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                                            style={{ width: members.length > 0 ? `${(cat.count / members.length) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Gender split */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Gender Distribution</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                                    <p className="text-2xl font-heading font-extrabold text-slate-900">{stats.male}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Male Members</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                                    <p className="text-2xl font-heading font-extrabold text-slate-900">{stats.female}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Female Members</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Class Distribution */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                        <h3 className="font-heading font-bold text-foreground text-base mb-1">
                            Pathfinder Rank Distribution
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Active progression across classes</p>

                        {members.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2.5">
                                {PATHFINDER_CLASSES.map(cls => {
                                    const count = stats.classDist[cls] || 0;
                                    return (
                                        <div
                                            key={cls}
                                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-primary/40 bg-slate-50/50 transition-colors"
                                        >
                                            <span className="text-xs font-medium text-foreground">{cls}</span>
                                            <span
                                                className={`text-xs font-heading font-extrabold px-2 py-0.5 rounded ${
                                                    count > 0 ? 'bg-primary/10 text-primary' : 'text-slate-400'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-xs text-slate-500 mb-3">No members enrolled in this church unit yet.</p>
                                <Button asChild size="sm" className="bg-primary text-white text-xs">
                                    <Link to="/church/members/add">
                                        + Enroll First Member
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Recent Members Overview */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div>
                                <h3 className="font-heading font-bold text-foreground text-base">
                                    Members Overview & Recent Enrollees
                                </h3>
                                <p className="text-xs text-slate-500">Active membership records and recent directory additions</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild size="sm" variant="outline" className="text-xs font-semibold border-slate-200">
                                    <Link to="/church/members">Full Members Roster →</Link>
                                </Button>
                            </div>
                        </div>
                        {stats.recentMembers.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {stats.recentMembers.slice(0, 8).map(member => (
                                    <div key={member.id} className="flex items-center justify-between py-3 gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-heading font-bold text-xs shrink-0">
                                                {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-foreground leading-tight truncate">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate">
                                                    {member.membershipCategory} • {member.pathfinderClass}
                                                    {member.phone && <span className="ml-1.5 text-slate-400 font-mono">({member.phone})</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${
                                                    member.status === 'active'
                                                        ? 'bg-primary/10 text-primary border-primary/30'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {member.status}
                                            </Badge>
                                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                                                <Link to={`/church/members/edit/${member.id}`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">
                                No new members registered in the last 30 days.
                            </p>
                        )}
                    </div>
                </div>

                {/* Church Info Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <h3 className="font-heading font-bold text-foreground text-base mb-1">
                        Congregation Unit Profile
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Registered administrative contacts on record</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-0.5">Church Pastor</p>
                            <p className="font-bold text-slate-900">{church?.pastorName || 'Assigned Minister'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-0.5">District Conference</p>
                            <p className="font-bold text-slate-900">{church?.district || 'Santasi District'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-0.5">Official Email</p>
                            <p className="font-bold text-slate-900 truncate">{church?.contactEmail || '—'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-0.5">Contact Phone</p>
                            <p className="font-bold text-slate-900">{church?.contactPhone || '—'}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChurchDashboard;
