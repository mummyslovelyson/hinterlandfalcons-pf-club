import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import ApplicationCard from '@/components/admin/ApplicationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getRegistrations,
  updateRegistration,
  deleteRegistration,
  syncRegistrationsFromBackend,
  REGISTRATIONS_SYNC_EVENT,
} from '@/lib/registrations';
import { getChurches, syncChurchesFromBackend } from '@/lib/churches';
import { Registration, PATHFINDER_CLASSES, MEMBERSHIP_CATEGORIES } from '@/types/registration';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Trash2, CheckCircle2, XCircle, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusConfig = {
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold',
    badgeDot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    className: 'bg-primary/10 text-primary border-primary/30 font-semibold',
    badgeDot: 'bg-primary',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/30 font-semibold',
    badgeDot: 'bg-destructive',
  },
};

const Applications = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [churchFilter, setChurchFilter] = useState<string>('all');
  const [availableChurches, setAvailableChurches] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchRegistrations = () => {
    const data = getRegistrations();
    setRegistrations(data);
    syncRegistrationsFromBackend().then((fresh) => {
      if (fresh) setRegistrations(fresh);
    });
  };

  useEffect(() => {
    fetchRegistrations();

    // Load available churches
    const stored = getChurches();
    if (stored.length > 0) {
      setAvailableChurches(stored.map((c) => c.name));
    }
    syncChurchesFromBackend().then((list) => {
      if (list && list.length > 0) {
        setAvailableChurches(list.map((c) => c.name));
      }
    });

    window.addEventListener(REGISTRATIONS_SYNC_EVENT, fetchRegistrations);
    window.addEventListener('focus', fetchRegistrations);

    return () => {
      window.removeEventListener(REGISTRATIONS_SYNC_EVENT, fetchRegistrations);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        (reg.applicant?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.applicant?.church || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reg.guardian?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

      const matchesClass = classFilter === 'all' ||
        (Array.isArray(reg.membership?.completedClasses) && reg.membership.completedClasses.includes(classFilter));

      const matchesCategory = categoryFilter === 'all' ||
        reg.membership?.membershipCategory === categoryFilter;

      const matchesChurch = churchFilter === 'all' || reg.applicant?.church === churchFilter;

      return matchesSearch && matchesStatus && matchesClass && matchesCategory && matchesChurch;
    });
  }, [registrations, searchQuery, statusFilter, classFilter, categoryFilter, churchFilter]);

  // Executive KPI summary stats
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [registrations]);

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map(r => r.id)));
    }
  };

  const isAllSelected = filteredRegistrations.length > 0 && selectedIds.size === filteredRegistrations.length;

  // Single Actions
  const handleSingleApprove = (id: string, name: string) => {
    updateRegistration(id, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin',
    });
    toast.success(`Application for ${name} approved`);
    fetchRegistrations();
  };

  const handleSingleReject = (id: string, name: string) => {
    updateRegistration(id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin',
    });
    toast.success(`Application for ${name} rejected`);
    fetchRegistrations();
  };

  const handleSingleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the application for ${name}? This cannot be undone.`)) return;
    deleteRegistration(id);
    fetchRegistrations();
    toast.success('Application deleted');
  };

  // Bulk Actions
  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      updateRegistration(id, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin (Bulk)',
      });
    });
    toast.success(`${selectedIds.size} application(s) approved`);
    setSelectedIds(new Set());
    fetchRegistrations();
  };

  const handleBulkReject = () => {
    selectedIds.forEach(id => {
      updateRegistration(id, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin (Bulk)',
      });
    });
    toast.success(`${selectedIds.size} application(s) rejected`);
    setSelectedIds(new Set());
    fetchRegistrations();
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} application(s)? This cannot be undone.`)) return;
    selectedIds.forEach(id => {
      deleteRegistration(id);
    });
    setSelectedIds(new Set());
    fetchRegistrations();
    toast.success('Application(s) deleted');
  };

  // CSV Export
  const exportToCSV = (data: Registration[], filename: string) => {
    const headers = [
      'Registration ID',
      'Applicant Name',
      'Phone',
      'Address',
      'School',
      'School Type',
      'Grade',
      'Date of Birth',
      'Age',
      'Church',
      'Preferred Club',
      'Category',
      'Completed Classes',
      'Honors Earned',
      'Full Dress Uniform',
      'Full Field Uniform',
      'Guardian Name',
      'Guardian Relationship',
      'Guardian Phone',
      'Guardian Occupation',
      'Guardian Master Guide',
      'Status',
      'Submitted At',
    ];

    const rows = data.map(r => [
      r.id,
      r.applicant?.fullName || '',
      r.applicant?.phone || '',
      `"${r.applicant?.address || ''}"`,
      r.applicant?.school || '',
      r.applicant?.schoolType || '',
      r.applicant?.grade || '',
      r.applicant?.dateOfBirth || '',
      r.applicant?.age || 0,
      r.applicant?.church || '',
      r.applicant?.preferredClubName || '',
      r.membership?.membershipCategory || 'Pathfinder',
      `"${(r.membership?.completedClasses || []).join(', ')}"`,
      `"${r.membership?.honorsEarned || ''}"`,
      r.membership?.hasFullDressUniform ? 'Yes' : 'No',
      r.membership?.hasFullFieldUniform ? 'Yes' : 'No',
      r.guardian?.fullName || '',
      r.guardian?.relationship || '',
      r.guardian?.phone || '',
      r.guardian?.occupation || '',
      r.guardian?.isMasterGuide ? 'Yes' : 'No',
      r.status,
      r.submittedAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} records to ${filename}.csv`);
  };

  const handleExportAll = () => {
    exportToCSV(filteredRegistrations, `pathfinder-applications-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportSelected = () => {
    const selectedData = filteredRegistrations.filter(r => selectedIds.has(r.id));
    exportToCSV(selectedData, `pathfinder-selected-${new Date().toISOString().split('T')[0]}`);
  };

  // Stats for quick info
  const classStats = useMemo(() => {
    const classCount: Record<string, number> = {};
    PATHFINDER_CLASSES.forEach(cls => {
      classCount[cls] = registrations.filter(r => Array.isArray(r.membership?.completedClasses) && r.membership.completedClasses.includes(cls)).length;
    });
    return classCount;
  }, [registrations]);

  const categoryStats = useMemo(() => {
    const catCount: Record<string, number> = {};
    MEMBERSHIP_CATEGORIES.forEach(cat => {
      catCount[cat] = registrations.filter(r => r.membership?.membershipCategory === cat).length;
    });
    return catCount;
  }, [registrations]);

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ] as const;

  return (
    <>
      <AdminHeader
        title="Applications & Intake"
        subtitle={`${registrations.length} total applicant records recorded across Santasi AYM District.`}
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 w-full">
        <div className="w-full space-y-6">

          {/* Executive KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applications</span>
              <p className="text-3xl font-heading font-extrabold text-foreground mt-1">{stats.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Cumulative online submissions</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-3xl font-heading font-extrabold text-amber-600 mt-1">{stats.pending}</p>
              <p className="text-xs text-slate-400 mt-0.5">Awaiting club verification</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Approved</span>
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <p className="text-3xl font-heading font-extrabold text-primary mt-1">{stats.approved}</p>
              <p className="text-xs text-slate-400 mt-0.5">Inducted candidates</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rejected</span>
                <span className="h-2 w-2 rounded-full bg-slate-400" />
              </div>
              <p className="text-3xl font-heading font-extrabold text-slate-700 mt-1">{stats.rejected}</p>
              <p className="text-xs text-slate-400 mt-0.5">Archived submissions</p>
            </div>
          </div>

          {/* Top Actions & Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Input
                  placeholder="Search applicant name, church, or guardian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs h-10 w-full bg-slate-50/50 focus:bg-white border-slate-300"
                />
              </div>

              {/* Class Filter */}
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full lg:w-[180px] h-10 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {PATHFINDER_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls} ({classStats[cls] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-[180px] h-10 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MEMBERSHIP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat} ({categoryStats[cat] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Church Filter */}
              <Select value={churchFilter} onValueChange={setChurchFilter}>
                <SelectTrigger className="w-full lg:w-[200px] h-10 text-xs bg-white border-slate-300">
                  <SelectValue placeholder="Filter by Church" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Churches</SelectItem>
                  {availableChurches.map((churchName) => (
                    <SelectItem key={churchName} value={churchName}>
                      {churchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Switcher & Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      viewMode === 'table'
                        ? "bg-white text-foreground font-bold"
                        : "text-slate-600 hover:text-foreground"
                    )}
                    title="Table View"
                  >
                    <List className="h-3.5 w-3.5 mr-1" /> Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      viewMode === 'grid'
                        ? "bg-white text-foreground font-bold"
                        : "text-slate-600 hover:text-foreground"
                    )}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Grid
                  </button>
                </div>

                <Button variant="outline" size="sm" onClick={fetchRegistrations} className="shrink-0 h-10 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100">
                  ↻ Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportAll} className="shrink-0 h-10 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100">
                  ↓ Export CSV
                </Button>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-2">
                {filterButtons.map((filter) => {
                  const count = filter.value === 'all'
                    ? registrations.length
                    : registrations.filter(r => r.status === filter.value).length;
                  const isActive = statusFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active filter tags */}
              {(classFilter !== 'all' || categoryFilter !== 'all' || churchFilter !== 'all') && (
                <div className="flex items-center gap-2">
                  {classFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Class: {classFilter}
                    </Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Category: {categoryFilter}
                    </Badge>
                  )}
                  {churchFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Church: {churchFilter}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClassFilter('all');
                      setCategoryFilter('all');
                      setChurchFilter('all');
                    }}
                    className="text-xs h-7 px-2 text-slate-500 hover:text-foreground"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Selection / Bulk Actions Bar */}
          {filteredRegistrations.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={selectAll}
                />
                <label htmlFor="select-all" className="cursor-pointer font-semibold text-slate-800">
                  Select All ({filteredRegistrations.length} applicants)
                </label>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-primary mr-1">
                    {selectedIds.size} selected
                  </span>
                  <Button size="sm" onClick={handleBulkApprove} className="h-8 text-xs font-semibold bg-primary text-white hover:bg-primary/90">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkReject} className="h-8 text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50">
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportSelected} className="h-8 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100">
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkDelete} className="h-8 text-xs font-semibold text-destructive border-red-200 hover:bg-red-50 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Primary View Area: Full Table View or Card Grid */}
          {filteredRegistrations.length > 0 ? (
            viewMode === 'table' ? (
              /* Expanded Full Data Table View */
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4 w-12 text-center">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={selectAll}
                          />
                        </th>
                        <th className="py-3.5 px-4">Applicant & Contact</th>
                        <th className="py-3.5 px-4">Church & Club</th>
                        <th className="py-3.5 px-4">Age / Grade</th>
                        <th className="py-3.5 px-4">Category & Classes</th>
                        <th className="py-3.5 px-4">Guardian Details</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Submitted</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredRegistrations.map((app) => {
                        const isSelected = selectedIds.has(app.id);
                        const status = statusConfig[app.status] || statusConfig.pending;
                        const initials = app.applicant?.fullName
                          ? app.applicant.fullName
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .substring(0, 2)
                              .toUpperCase()
                          : 'PF';

                        return (
                          <tr
                            key={app.id}
                            className={cn(
                              "transition-colors hover:bg-slate-50/80",
                              isSelected && "bg-primary/5 hover:bg-primary/10"
                            )}
                          >
                            <td className="py-3.5 px-4 text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(app.id)}
                              />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-slate-200">
                                  <AvatarImage src={app.applicant?.profileImage} className="object-cover" />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <Link
                                    to={`/admin/applications/${app.id}`}
                                    className="font-heading font-bold text-slate-900 hover:text-primary transition-colors block text-sm leading-tight"
                                  >
                                    {app.applicant?.fullName || 'Unnamed Applicant'}
                                  </Link>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {app.applicant?.phone || 'No phone'} • ID: <span className="font-mono">{app.id}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-slate-900">{app.applicant?.church || 'Santasi SDA'}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{app.applicant?.preferredClubName || 'Hinterland Falcons'}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-slate-900">Age {app.applicant?.age || '—'}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {app.applicant?.grade || 'Unspecified grade'}
                                {app.applicant?.schoolType && ` (${app.applicant.schoolType})`}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary mb-1">
                                {app.membership?.membershipCategory || 'Pathfinder'}
                              </span>
                              <p className="text-[11px] text-slate-500 truncate max-w-[180px]" title={(app.membership?.completedClasses || []).join(', ')}>
                                {Array.isArray(app.membership?.completedClasses) && app.membership.completedClasses.length > 0
                                  ? app.membership.completedClasses.join(', ')
                                  : 'No prior classes'}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-slate-900">{app.guardian?.fullName || 'Not specified'}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {app.guardian?.phone || '—'} {app.guardian?.relationship && `(${app.guardian.relationship})`}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant="outline" className={cn('text-[11px] px-2.5 py-0.5', status.className)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5', status.badgeDot)} />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  asChild
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-slate-700 border-slate-300 hover:text-primary hover:bg-slate-100"
                                  title="View Full Application Dossier"
                                >
                                  <Link to={`/admin/applications/${app.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>

                                {app.status !== 'approved' && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleSingleApprove(app.id, app.applicant?.fullName || 'applicant')}
                                    className="h-8 w-8 text-primary border-slate-300 hover:bg-primary/10 hover:border-primary/40"
                                    title="Quick Approve"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}

                                {app.status !== 'rejected' && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleSingleReject(app.id, app.applicant?.fullName || 'applicant')}
                                    className="h-8 w-8 text-amber-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300"
                                    title="Quick Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleSingleDelete(app.id, app.applicant?.fullName || 'applicant')}
                                  className="h-8 w-8 text-destructive border-slate-300 hover:text-destructive hover:bg-red-50 hover:border-red-300"
                                  title="Delete Application"
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
              </div>
            ) : (
              /* Expanded Responsive Card Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredRegistrations.map((app) => (
                  <div key={app.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedIds.has(app.id)}
                        onCheckedChange={() => toggleSelection(app.id)}
                      />
                    </div>
                    <div className="pl-6">
                      <ApplicationCard
                        application={app}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-16 text-center space-y-3">
              <p className="font-heading font-bold text-lg text-slate-900">No applications found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No records match your active search and filter criteria. Try clearing search filters or changing status.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setClassFilter('all');
                  setCategoryFilter('all');
                }}
                className="text-xs font-semibold mt-2"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Applications;
