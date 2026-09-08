import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Inbox,
    Search,
    CheckCircle2,
    Clock,
    UserPlus,
    Eye,
    Phone,
    Shield,
    FileText,
    Check,
    X,
    RotateCcw,
    UserCheck,
    Building2,
    Flame,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import {
    getChurchApplications,
    syncChurchApplicationsFromBackend,
    updateChurchApplicationStatus,
    enrollChurchApplication,
    CHURCH_APPLICATIONS_SYNC_EVENT,
} from '@/lib/churches';
import { Registration } from '@/types/registration';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusBadges = {
    pending: {
        label: 'Pending Review',
        className: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        dot: 'bg-amber-500',
    },
    approved: {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
        dot: 'bg-emerald-500',
    },
    rejected: {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
        dot: 'bg-rose-500',
    },
};

const ChurchApplications = () => {
    const { church } = useChurchAuth();
    const [applications, setApplications] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedApp, setSelectedApp] = useState<Registration | null>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');

    const loadData = () => {
        const apps = getChurchApplications();
        setApplications(apps);
    };

    useEffect(() => {
        loadData();
        syncChurchApplicationsFromBackend().then((fresh) => {
            if (fresh) setApplications(fresh);
        });

        const handleSync = (e: Event) => {
            const customEvent = e as CustomEvent<Registration[]>;
            if (customEvent.detail) {
                setApplications(customEvent.detail);
            } else {
                loadData();
            }
        };

        window.addEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, handleSync);
        return () => window.removeEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, handleSync);
    }, []);

    // Filtered applications
    const filteredApps = useMemo(() => {
        return applications.filter((app) => {
            const query = searchQuery.toLowerCase().trim();
            const applicant = app.applicant || {};
            const matchesSearch =
                !query ||
                (applicant.fullName || '').toLowerCase().includes(query) ||
                (applicant.phone || '').includes(query) ||
                (applicant.school || '').toLowerCase().includes(query) ||
                (app.guardian?.fullName || '').toLowerCase().includes(query) ||
                app.id.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' || app.status === statusFilter;

            const matchesCategory =
                categoryFilter === 'all' ||
                app.membership?.membershipCategory === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [applications, searchQuery, statusFilter, categoryFilter]);

    // Summary statistics
    const stats = useMemo(() => {
        const total = applications.length;
        const pending = applications.filter(a => a.status === 'pending').length;
        const approved = applications.filter(a => a.status === 'approved').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;
        const youth = applications.filter(
            a => a.membership?.membershipCategory === 'Senior Youth' ||
                 a.membership?.membershipCategory === 'Master Guide' ||
                 (a.applicant?.age && a.applicant.age >= 16)
        ).length;

        return { total, pending, approved, rejected, youth };
    }, [applications]);

    const handleUpdateStatus = async (appId: string, status: 'pending' | 'approved' | 'rejected') => {
        try {
            await updateChurchApplicationStatus(appId, status, reviewNotes);
            toast.success(`Application marked as ${status}`);
            if (selectedApp?.id === appId) {
                setSelectedApp({ ...selectedApp, status, notes: reviewNotes || selectedApp.notes });
            }
        } catch {
            toast.error('Failed to update application status');
        }
    };

    const handleEnroll = async (app: Registration) => {
        setIsEnrolling(true);
        try {
            const res = await enrollChurchApplication(app.id, app);
            if (res?.ok) {
                toast.success(`${app.applicant?.fullName || 'Applicant'} successfully enrolled into church roster!`);
                if (selectedApp?.id === app.id) {
                    setSelectedApp({ ...selectedApp, status: 'approved', notes: 'Enrolled into church roster' });
                }
            } else {
                toast.error('Could not complete enrollment. Please try again.');
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            toast.error('Failed to enroll member');
        } finally {
            setIsEnrolling(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCategoryFilter('all');
    };

    const hasFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all';

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full bg-slate-50/50">
            {/* Top Header */}
            <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-5 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                                <Inbox className="h-6 w-6 text-primary" />
                                Membership Applications Intake
                            </h1>
                            {stats.pending > 0 && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-0.5">
                                    {stats.pending} Awaiting Review
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Receive, review, and enroll new Pathfinder and Youth candidates applying to {church?.name || 'Local Church'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="border-slate-200">
                            <Link to="/church/members">
                                <UserCheck className="h-4 w-4 mr-1.5 text-primary" />
                                View Active Roster
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="border-amber-200 bg-amber-50/40 text-amber-900">
                            <Link to="/church/youth">
                                <Flame className="h-4 w-4 mr-1.5 text-amber-600" />
                                Youth Ministry
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full space-y-6">
                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Received</span>
                            <FileText className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-foreground mt-2">{stats.total}</p>
                        <p className="text-xs text-slate-500 mt-1">Submitted applications</p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50/60 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-amber-950 mt-2">{stats.pending}</p>
                        <p className="text-xs text-amber-700/80 mt-1">Requires church action</p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50/60 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Approved & Enrolled</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-emerald-950 mt-2">{stats.approved}</p>
                        <p className="text-xs text-emerald-700/80 mt-1">Active church candidates</p>
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-linear-to-br from-indigo-50/60 to-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Youth Candidates</span>
                            <Flame className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-heading font-extrabold text-indigo-950 mt-2">{stats.youth}</p>
                        <p className="text-xs text-indigo-700/80 mt-1">Senior Youth & Master Guides</p>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by applicant name, phone, school, or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 text-xs bg-slate-50/60 focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                                <SelectTrigger className="h-10 text-xs w-[140px] bg-slate-50/60">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                                    <SelectItem value="pending" className="text-xs">Pending ({stats.pending})</SelectItem>
                                    <SelectItem value="approved" className="text-xs">Approved ({stats.approved})</SelectItem>
                                    <SelectItem value="rejected" className="text-xs">Rejected ({stats.rejected})</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-10 text-xs w-[140px] bg-slate-50/60">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                                    <SelectItem value="Pathfinder" className="text-xs">Pathfinder</SelectItem>
                                    <SelectItem value="Senior Youth" className="text-xs">Senior Youth</SelectItem>
                                    <SelectItem value="Master Guide" className="text-xs">Master Guide</SelectItem>
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

                {/* Applications Table */}
                {filteredApps.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-4 py-3.5">Applicant Candidate</th>
                                        <th className="px-4 py-3.5">Category & School</th>
                                        <th className="px-4 py-3.5">Guardian Details</th>
                                        <th className="px-4 py-3.5">Date Submitted</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Review Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredApps.map((app) => {
                                        const badge = statusBadges[app.status] || statusBadges.pending;
                                        const isYouth = app.membership?.membershipCategory === 'Senior Youth' || app.membership?.membershipCategory === 'Master Guide' || (app.applicant?.age && app.applicant.age >= 16);

                                        return (
                                            <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-heading font-bold flex items-center justify-center shrink-0">
                                                            {(app.applicant?.fullName || 'A').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-foreground text-sm block">
                                                                {app.applicant?.fullName || 'Unnamed Applicant'}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                                                <span>Age {app.applicant?.age || 'N/A'}</span>
                                                                <span>•</span>
                                                                <Phone className="h-3 w-3" />
                                                                <span>{app.applicant?.phone || 'No phone'}</span>
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
                                                                isYouth
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                            )}
                                                        >
                                                            {app.membership?.membershipCategory || 'Pathfinder'}
                                                        </Badge>
                                                        <p className="text-[11px] text-slate-600 font-medium truncate max-w-[200px]">
                                                            {app.applicant?.school || 'School unlisted'} ({app.applicant?.grade || 'N/A'})
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div>
                                                        <span className="font-medium text-foreground block">
                                                            {app.guardian?.fullName || 'Not specified'}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {app.guardian?.relationship || 'Guardian'} • {app.guardian?.phone || 'No contact'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                                                    {new Date(app.submittedAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <Badge variant="outline" className={cn('text-xs flex items-center gap-1.5 w-fit', badge.className)}>
                                                        <span className={cn('h-1.5 w-1.5 rounded-full', badge.dot)} />
                                                        {badge.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs font-semibold hover:bg-primary hover:text-white"
                                                            onClick={() => {
                                                                setSelectedApp(app);
                                                                setReviewNotes(app.notes || '');
                                                            }}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Review & Details
                                                        </Button>

                                                        {app.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                                                onClick={() => handleEnroll(app)}
                                                            >
                                                                <UserPlus className="h-3.5 w-3.5 mr-1" />
                                                                Enroll
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                        <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-heading text-lg font-bold text-foreground">No Applications Found</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                            {hasFilters
                                ? 'No applications match your active filters. Try adjusting search or status criteria.'
                                : `No new membership applications have been received for ${church?.name || 'your church'} yet.`}
                        </p>
                        {hasFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </main>

            {/* Application Detail Dialog */}
            <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedApp && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <DialogTitle className="font-heading text-xl font-bold text-foreground">
                                            Application: {selectedApp.applicant?.fullName}
                                        </DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                            Application ID: {selectedApp.id} • Submitted on {new Date(selectedApp.submittedAt).toLocaleString()}
                                        </DialogDescription>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs flex items-center gap-1.5 shrink-0',
                                            statusBadges[selectedApp.status]?.className
                                        )}
                                    >
                                        <span className={cn('h-1.5 w-1.5 rounded-full', statusBadges[selectedApp.status]?.dot)} />
                                        {statusBadges[selectedApp.status]?.label}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6 pt-2">
                                {/* Applicant Profile Card */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        Personal & Educational Information
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-400 block">Full Name</span>
                                            <span className="font-semibold text-foreground">{selectedApp.applicant?.fullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Phone</span>
                                            <span className="font-semibold text-foreground">{selectedApp.applicant?.phone || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Date of Birth & Age</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedApp.applicant?.dateOfBirth} (Age {selectedApp.applicant?.age})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Institution / School</span>
                                            <span className="font-semibold text-foreground">{selectedApp.applicant?.school || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">School Type & Grade</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedApp.applicant?.schoolType || 'N/A'} • {selectedApp.applicant?.grade || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Residential Address</span>
                                            <span className="font-semibold text-foreground">{selectedApp.applicant?.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Membership & Club Info */}
                                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Membership Category & Background
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-400 block">Desired Category</span>
                                            <Badge variant="outline" className="font-bold text-xs mt-0.5">
                                                {selectedApp.membership?.membershipCategory || 'Pathfinder'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Previous Experience</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedApp.membership?.wasPreviousPathfinder
                                                    ? `Yes (${selectedApp.membership.previousClubName || 'Previous Club'})`
                                                    : 'New Member'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Completed Classes</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedApp.membership?.completedClasses?.join(', ') || 'None yet'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Honors Earned</span>
                                            <span className="font-semibold text-foreground">{selectedApp.membership?.honorsEarned || 'None listed'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Uniform Status</span>
                                            <span className="font-semibold text-foreground">
                                                Dress: {selectedApp.membership?.hasFullDressUniform ? 'Yes' : 'No'} • Field: {selectedApp.membership?.hasFullFieldUniform ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian & Emergency Details */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        Guardian & Emergency Contact
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="text-slate-400 block">Guardian Name</span>
                                            <span className="font-semibold text-foreground">{selectedApp.guardian?.fullName || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Relationship</span>
                                            <span className="font-semibold text-foreground">{selectedApp.guardian?.relationship || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Phone</span>
                                            <span className="font-semibold text-foreground">{selectedApp.guardian?.phone || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Occupation</span>
                                            <span className="font-semibold text-foreground">{selectedApp.guardian?.occupation || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Master Guide Status</span>
                                            <span className="font-semibold text-foreground">
                                                {selectedApp.guardian?.isMasterGuide ? 'Yes (Master Guide)' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Consent & Signature */}
                                {selectedApp.consent && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                                        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-600">
                                            Signed Consent & Waiver
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 font-medium">
                                                Signed By: <span className="font-bold text-foreground">{selectedApp.consent.signature}</span>
                                            </span>
                                            <span className="text-slate-400">
                                                Date: {new Date(selectedApp.consent.signatureDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Church Review Notes */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700">Church Review Notes</label>
                                    <Input
                                        placeholder="Add notes (e.g. Assigned to Friend class / Verified church membership)..."
                                        value={reviewNotes}
                                        onChange={e => setReviewNotes(e.target.value)}
                                        className="h-10 text-xs"
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                                            className="text-destructive hover:bg-destructive/10 text-xs w-full sm:w-auto"
                                        >
                                            <X className="h-3.5 w-3.5 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                                            className="text-emerald-700 hover:bg-emerald-50 text-xs w-full sm:w-auto"
                                        >
                                            <Check className="h-3.5 w-3.5 mr-1" />
                                            Mark Approved
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        disabled={isEnrolling}
                                        onClick={() => handleEnroll(selectedApp)}
                                        className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-5 shadow-xs w-full sm:w-auto"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        {isEnrolling ? 'Enrolling...' : 'Approve & Enroll Into Church Roster'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChurchApplications;
