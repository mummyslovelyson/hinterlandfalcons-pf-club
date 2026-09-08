import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
    Search,
    UserPlus,
    Users,
    Eye,
    Trash2,
    Download,
    Phone,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    CheckSquare,
    X,
    RotateCcw,
    UserCheck,
    UserX,
    Edit,
    SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
    getChurchMembers,
    deleteChurchMember,
    updateChurchMember,
    syncChurchMembersFromBackend,
} from '@/lib/churches';

type SortField = 'name' | 'category' | 'class' | 'dateJoined' | 'status';
type SortDir = 'asc' | 'desc';

const ChurchMembers = () => {
    const { church } = useChurchAuth();
    const [members, setMembers] = useState<ChurchMember[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewMember, setViewMember] = useState<ChurchMember | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const fetchMembers = useCallback(() => {
        if (church) {
            setMembers(getChurchMembers(church.id));
            syncChurchMembersFromBackend(true).then((list) => {
                if (list && list.length > 0) {
                    setMembers(list.filter((m) => m.churchId === church.id));
                }
            });
        }
    }, [church]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Filter
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchSearch =
                `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.phone.includes(searchQuery) ||
                m.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || m.status === statusFilter;
            const matchCategory = categoryFilter === 'all' || m.membershipCategory === categoryFilter;
            const matchClass = classFilter === 'all' || m.pathfinderClass === classFilter;
            return matchSearch && matchStatus && matchCategory && matchClass;
        });
    }, [members, searchQuery, statusFilter, categoryFilter, classFilter]);

    // Sort
    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'name': cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`); break;
                case 'category': cmp = a.membershipCategory.localeCompare(b.membershipCategory); break;
                case 'class': cmp = a.pathfinderClass.localeCompare(b.pathfinderClass); break;
                case 'dateJoined': cmp = new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime(); break;
                case 'status': cmp = a.status.localeCompare(b.status); break;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filteredMembers, sortField, sortDir]);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
        return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
    };

    // Selection
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
    const selectAll = () => {
        setSelectedIds(selectedIds.size === sortedMembers.length ? new Set() : new Set(sortedMembers.map(m => m.id)));
    };
    const isAllSelected = sortedMembers.length > 0 && selectedIds.size === sortedMembers.length;

    // Bulk actions
    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} member(s)? This cannot be undone.`)) return;
        try {
            await Promise.all(Array.from(selectedIds).map((id) => deleteChurchMember(id, true)));
            toast.success(`${selectedIds.size} member(s) deleted`);
            setSelectedIds(new Set());
            fetchMembers();
        } catch (err) {
            console.error('Failed to delete members:', err);
            toast.error('Failed to delete selected members');
        }
    };

    const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
        try {
            const updates = Array.from(selectedIds).map((id) => {
                const member = members.find((m) => m.id === id);
                return member ? updateChurchMember({ ...member, status }, true) : Promise.resolve();
            });
            await Promise.all(updates);
            toast.success(`${selectedIds.size} member(s) set to ${status}`);
            setSelectedIds(new Set());
            fetchMembers();
        } catch (err) {
            console.error('Failed to update member statuses:', err);
            toast.error('Failed to update selected member status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this member?')) return;
        try {
            await deleteChurchMember(id, true);
            toast.success('Member deleted');
            setViewMember(null);
            fetchMembers();
        } catch (err) {
            console.error('Failed to delete member:', err);
            toast.error('Failed to delete member');
        }
    };

    // Export
    const exportToCSV = (data: ChurchMember[]) => {
        const headers = ['ID', 'First Name', 'Last Name', 'DOB', 'Gender', 'Phone', 'Email', 'Address', 'Category', 'Class', 'Parent/Guardian', 'Guardian Phone', 'Emergency Contact', 'Emergency Phone', 'Date Joined', 'Status', 'Notes'];
        const rows = data.map(m => [
            m.id, `"${m.firstName}"`, `"${m.lastName}"`, m.dateOfBirth, m.gender, m.phone, m.email,
            `"${m.address}"`, m.membershipCategory, m.pathfinderClass,
            `"${m.parentGuardianName}"`, m.parentGuardianPhone, `"${m.emergencyContact}"`, m.emergencyPhone,
            m.dateJoined, m.status, `"${(m.specialNotes || '').replace(/"/g, '""')}"`,
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `church-members-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${data.length} member(s)`);
    };

    const hasFilters = searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || classFilter !== 'all';
    const clearFilters = () => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setClassFilter('all'); };

    const activeCount = members.filter(m => m.status === 'active').length;
    const inactiveCount = members.filter(m => m.status === 'inactive').length;

    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
            {/* Header */}
            <div className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-5 shrink-0">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Members Overview</h1>
                        <p className="text-sm text-muted-foreground">{members.length} total • {activeCount} active • {inactiveCount} inactive</p>
                    </div>
                    <Button asChild size="sm">
                        <Link to="/church/members/add"><UserPlus className="h-4 w-4 mr-2" />Add Member</Link>
                    </Button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
                {/* Search + Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(showFilters && 'bg-primary/5 border-primary/30')}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchMembers}>
                            <RotateCcw className="h-4 w-4 mr-1" /> Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => exportToCSV(sortedMembers)} disabled={sortedMembers.length === 0}>
                            <Download className="h-4 w-4 mr-1" /> Export
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="rounded-xl border border-border bg-card p-4 mb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-foreground">Filter Members</h4>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                                    <RotateCcw className="h-3 w-3 mr-1" /> Clear All
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Status</label>
                                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {MEMBERSHIP_CATEGORIES_CHURCH.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Class</label>
                                <Select value={classFilter} onValueChange={setClassFilter}>
                                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {PATHFINDER_CLASSES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active filter tags */}
                {hasFilters && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1 text-xs">Search: "{searchQuery}" <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} /></Badge>
                        )}
                        {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="gap-1 text-xs">Status: {statusFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} /></Badge>
                        )}
                        {categoryFilter !== 'all' && (
                            <Badge variant="secondary" className="gap-1 text-xs">Category: {categoryFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} /></Badge>
                        )}
                        {classFilter !== 'all' && (
                            <Badge variant="secondary" className="gap-1 text-xs">Class: {classFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => setClassFilter('all')} /></Badge>
                        )}
                    </div>
                )}

                {/* Result count */}
                <p className="text-xs text-muted-foreground mb-3">
                    Showing {sortedMembers.length} of {members.length} member{members.length !== 1 ? 's' : ''}
                    {selectedIds.size > 0 && <span className="text-primary font-medium"> • {selectedIds.size} selected</span>}
                </p>

                {/* Table */}
                {sortedMembers.length > 0 ? (
                    <>
                    <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-3 w-10">
                                            <Checkbox checked={isAllSelected} onCheckedChange={selectAll} />
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer" onClick={() => handleSort('name')}>
                                            <span className="flex items-center gap-1.5">Name <SortIcon field="name" /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer" onClick={() => handleSort('category')}>
                                            <span className="flex items-center gap-1.5">Category <SortIcon field="category" /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer" onClick={() => handleSort('class')}>
                                            <span className="flex items-center gap-1.5">Class <SortIcon field="class" /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer" onClick={() => handleSort('status')}>
                                            <span className="flex items-center gap-1.5">Status <SortIcon field="status" /></span>
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sortedMembers.map(member => (
                                        <tr key={member.id} className={cn('hover:bg-muted/30 transition-colors', selectedIds.has(member.id) && 'bg-primary/5')}>
                                            <td className="px-3 py-4">
                                                <Checkbox checked={selectedIds.has(member.id)} onCheckedChange={() => toggleSelect(member.id)} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{member.firstName} {member.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{member.gender} • {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-foreground flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /> {member.phone || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">{member.email || 'N/A'}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="text-xs">{member.membershipCategory}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-foreground">{member.pathfinderClass}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    className={cn('text-xs', member.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border')}
                                                    variant="outline"
                                                >
                                                    {member.status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                                                    {member.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMember(member)} title="View details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Edit member">
                                                        <Link to={`/church/members/edit/${member.id}`}><Edit className="h-4 w-4" /></Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(member.id)} title="Delete">
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

                    <div className="md:hidden space-y-3">
                        {sortedMembers.map(member => (
                            <div
                                key={member.id}
                                className={cn(
                                    'rounded-xl border border-border bg-card p-4',
                                    selectedIds.has(member.id) && 'border-primary/40 bg-primary/5'
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <Checkbox checked={selectedIds.has(member.id)} onCheckedChange={() => toggleSelect(member.id)} className="mt-1" />
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                                        {member.firstName[0]}{member.lastName[0]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground text-sm">{member.firstName} {member.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{member.membershipCategory} • {member.pathfinderClass}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{member.phone || 'No phone'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge
                                                className={cn('text-xs', member.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border')}
                                                variant="outline"
                                            >
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-border">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMember(member)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                        <Link to={`/church/members/edit/${member.id}`}><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(member.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <div className="text-center py-12 rounded-xl border border-border bg-card">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-heading font-semibold text-foreground mb-2">No Members Found</h3>
                        <p className="text-sm text-muted-foreground">
                            {hasFilters ? 'Adjust your filters to see more results.' : 'Start by adding your first church member using the Add Member button above.'}
                        </p>
                        {hasFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </main>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-lg px-4 sm:px-6 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <CheckSquare className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-foreground">{selectedIds.size} selected</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('active')}>
                                <UserCheck className="h-3.5 w-3.5 mr-1" /> Set Active
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('inactive')}>
                                <UserX className="h-3.5 w-3.5 mr-1" /> Set Inactive
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => exportToCSV(sortedMembers.filter(m => selectedIds.has(m.id)))}>
                                <Download className="h-3.5 w-3.5 mr-1" /> Export
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                                <X className="h-3.5 w-3.5 mr-1" /> Deselect
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Member Centered Modal */}
            {viewMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setViewMember(null)} />
                    <div className="relative w-full max-w-xl max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-150 z-10">
                        <div className="sticky top-0 z-10 bg-card border-b border-border p-6 flex items-center justify-between">
                            <div>
                                <h2 className="font-heading text-lg font-bold text-foreground">Member Details</h2>
                                <p className="text-xs text-muted-foreground font-mono">{viewMember.id}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setViewMember(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile header */}
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                                    {viewMember.firstName[0]}{viewMember.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{viewMember.firstName} {viewMember.lastName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">{viewMember.membershipCategory}</Badge>
                                        <Badge className={cn('text-xs', viewMember.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')} variant="outline">{viewMember.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="rounded-xl border border-border p-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3">Personal Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-xs text-muted-foreground">Date of Birth</p><p className="font-medium">{viewMember.dateOfBirth ? new Date(viewMember.dateOfBirth).toLocaleDateString() : 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Gender</p><p className="font-medium">{viewMember.gender}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{viewMember.phone || 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{viewMember.email || 'N/A'}</p></div>
                                    <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{viewMember.address || 'N/A'}</p></div>
                                </div>
                            </div>

                            {/* Pathfinder Info */}
                            <div className="rounded-xl border border-border p-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3">Pathfinder Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{viewMember.membershipCategory}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">{viewMember.pathfinderClass}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Date Joined</p><p className="font-medium">{viewMember.dateJoined ? new Date(viewMember.dateJoined).toLocaleDateString() : 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Status</p><p className="font-medium capitalize">{viewMember.status}</p></div>
                                </div>
                            </div>

                            {/* Guardian / Emergency */}
                            <div className="rounded-xl border border-border p-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3">Guardian & Emergency</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-xs text-muted-foreground">Parent/Guardian</p><p className="font-medium">{viewMember.parentGuardianName || 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Guardian Phone</p><p className="font-medium">{viewMember.parentGuardianPhone || 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Emergency Contact</p><p className="font-medium">{viewMember.emergencyContact || 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Emergency Phone</p><p className="font-medium">{viewMember.emergencyPhone || 'N/A'}</p></div>
                                </div>
                            </div>

                            {/* Notes */}
                            {viewMember.specialNotes && (
                                <div className="rounded-xl border border-border p-4">
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Notes</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{viewMember.specialNotes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button asChild variant="outline" size="sm" className="gap-1">
                                    <Link to={`/church/members/edit/${viewMember.id}`}><Edit className="h-3.5 w-3.5" /> Edit Member</Link>
                                </Button>
                                <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(viewMember.id)}>
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChurchMembers;
