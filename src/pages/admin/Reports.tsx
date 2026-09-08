import { useEffect, useState, useMemo } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { getRegistrations, syncRegistrationsFromBackend } from '@/lib/registrations';
import { Registration, PATHFINDER_CLASSES, MEMBERSHIP_CATEGORIES } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar
} from 'recharts';

const Reports = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [activeExportTab, setActiveExportTab] = useState<'class' | 'category' | 'status'>('class');

    useEffect(() => {
        const data = getRegistrations();
        setRegistrations(data);
        syncRegistrationsFromBackend().then((fresh) => {
            if (fresh) setRegistrations(fresh);
        });
    }, []);

    // --- Metrics Calculations ---
    const totalRegistered = registrations.length;

    // Uniform Readiness
    const fullUniformCount = registrations.filter(r => r.membership?.hasFullDressUniform).length;
    const uniformReadinessRate = totalRegistered > 0 ? Math.round((fullUniformCount / totalRegistered) * 100) : 0;

    // Completion Rate
    const approvedCount = registrations.filter(r => r.status === 'approved').length;
    const completionRate = totalRegistered > 0 ? Math.round((approvedCount / totalRegistered) * 100) : 0;

    // New Members (This Month)
    const currentMonthIdx = new Date().getMonth();
    const newMembersCount = registrations.filter(r => {
        const d = new Date(r.submittedAt);
        return d.getMonth() === currentMonthIdx;
    }).length;

    // --- Chart Data Preparation ---

    // 1. Trends Data
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const trendsData = months.map((month, index) => {
        const count = registrations.filter(r => new Date(r.submittedAt).getMonth() === index).length;
        return { name: month, count };
    });

    // 2. Class Distribution Data - using actual completedClasses
    const classDistData = useMemo(() => {
        return PATHFINDER_CLASSES.map(cls => ({
            name: cls,
            count: registrations.filter(r => Array.isArray(r.membership?.completedClasses) && r.membership.completedClasses.includes(cls)).length,
        }));
    }, [registrations]);

    const pieData: { name: string; value: number }[] = classDistData.filter(d => d.count > 0).map(d => ({ name: d.name, value: d.count }));
    if (pieData.length === 0) {
        pieData.push({ name: 'No Active Records', value: 1 });
    }

    // Authentic Hinterland Falcons Club Palette
    const CLUB_PALETTE = ['#22534f', '#d7a60c', '#2e5a1e', '#c3b091', '#163f3c', '#b45309', '#475569', '#0f766e'];

    // 3. Category Distribution
    const categoryDistData = useMemo(() => {
        return MEMBERSHIP_CATEGORIES.map(cat => ({
            name: cat,
            count: registrations.filter(r => r.membership.membershipCategory === cat).length,
        }));
    }, [registrations]);

    // 4. Uniform Readiness Doughnut Data
    const uniformData = [
        { name: 'Full Uniform', value: fullUniformCount },
        { name: 'Incomplete', value: Math.max(0, totalRegistered - fullUniformCount) }
    ];
    if (totalRegistered === 0) {
        uniformData[1].value = 1;
    }
    const UNIFORM_COLORS = ['#22534f', '#e2e8f0'];

    // --- Geographic Distribution ---
    const churchDist: Record<string, number> = {};
    registrations.forEach(r => {
        const church = r.applicant.church || 'Santasi SDA Church';
        churchDist[church] = (churchDist[church] || 0) + 1;
    });

    const sortedLocations = Object.entries(churchDist)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, count], idx) => ({
            rank: String(idx + 1).padStart(2, '0'),
            name,
            district: 'Santasi District AYM',
            count,
            color: idx === 0 ? 'text-primary' : 'text-slate-500'
        }));

    // --- Export Functions ---
    const exportToCSV = (data: Registration[], filename: string) => {
        const headers = [
            'ID', 'Full Name', 'Phone', 'Address', 'School', 'School Type', 'Grade',
            'Date of Birth', 'Age', 'Church', 'Preferred Club', 'Membership Category',
            'Completed Classes', 'Honors Earned', 'Dress Uniform', 'Field Uniform',
            'Guardian Name', 'Guardian Relationship', 'Guardian Phone', 'Guardian Occupation',
            'Guardian Is Master Guide', 'Status', 'Submitted At', 'Reviewed At',
            'Has Certificate', 'Has Ghana Card'
        ];

        const rows = data.map(r => [
            r.id,
            `"${r.applicant.fullName}"`,
            r.applicant.phone,
            `"${r.applicant.address}"`,
            r.applicant.school,
            r.applicant.schoolType,
            r.applicant.grade,
            r.applicant.dateOfBirth,
            r.applicant.age,
            `"${r.applicant.church}"`,
            `"${r.applicant.preferredClubName}"`,
            r.membership.membershipCategory || 'Pathfinder',
            `"${(r.membership.completedClasses || []).join(', ')}"`,
            `"${r.membership.honorsEarned || ''}"`,
            r.membership.hasFullDressUniform ? 'Yes' : 'No',
            r.membership.hasFullFieldUniform ? 'Yes' : 'No',
            `"${r.guardian.fullName}"`,
            r.guardian.relationship,
            r.guardian.phone,
            `"${r.guardian.occupation}"`,
            r.guardian.isMasterGuide ? 'Yes' : 'No',
            r.status,
            r.submittedAt,
            r.reviewedAt || '',
            r.membership.certificateImage ? 'Yes' : 'No',
            r.applicant.ghanaCardImage ? 'Yes' : 'No',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportByClass = (className: string) => {
        const filtered = registrations.filter(r =>
            Array.isArray(r.membership?.completedClasses) && r.membership.completedClasses.includes(className)
        );
        if (filtered.length === 0) {
            return;
        }
        exportToCSV(filtered, `Santasi_AYM_Class_${className.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportByCategory = (category: string) => {
        const filtered = registrations.filter(r =>
            r.membership.membershipCategory === category
        );
        if (filtered.length === 0) {
            return;
        }
        exportToCSV(filtered, `Santasi_AYM_Category_${category.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportByStatus = (status: string) => {
        const filtered = registrations.filter(r => r.status === status);
        if (filtered.length === 0) {
            return;
        }
        exportToCSV(filtered, `Santasi_AYM_Status_${status}_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportAll = () => {
        if (registrations.length === 0) return;
        exportToCSV(registrations, `Santasi_AYM_Complete_Registry_${new Date().toISOString().split('T')[0]}`);
    };

    // Certificate & Ghana Card stats
    const certCount = registrations.filter(r => r.membership.certificateImage).length;
    const ghanaCardCount = registrations.filter(r => r.applicant.ghanaCardImage).length;
    const profilePhotoCount = registrations.filter(r => r.applicant.profileImage).length;

    return (
        <>
            <AdminHeader
                title="Analytics & Data Engine"
                subtitle="Real-time membership telemetry, class distributions, and executive CSV reporting."
            />

            <div className="flex-1 overflow-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                                01
                            </span>
                            <div>
                                <p className="font-heading font-bold text-sm text-foreground">Hinterland Falcons Registry Intelligence</p>
                                <p className="text-xs text-slate-500">Synchronized with Santasi AYM live membership database</p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 font-semibold text-xs hover:bg-slate-50 hover:text-primary"
                            onClick={handleExportAll}
                            disabled={registrations.length === 0}
                        >
                            ↓ Export Master Roster (CSV)
                        </Button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Total Registered"
                            value={totalRegistered}
                            variant="primary"
                            trend={{ value: 12, isPositive: true }}
                        />
                        <StatsCard
                            title="Approval Rate"
                            value={`${completionRate}%`}
                            variant="success"
                        />
                        <StatsCard
                            title="New Cohort Intake"
                            value={`+${newMembersCount}`}
                            variant="accent"
                            description="Active calendar month"
                        />
                        <StatsCard
                            title="Uniform Readiness"
                            value={`${uniformReadinessRate}%`}
                            variant="default"
                            description={`${fullUniformCount} of ${totalRegistered} in full regalia`}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Registration Trends (Area Chart) */}
                        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="text-foreground font-heading font-bold text-base">Intake Trend Analysis</h4>
                                    <p className="text-xs text-slate-500">Monthly registration volume across Santasi District</p>
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                    Current Year
                                </span>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22534f" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#22534f" stopOpacity={0.01} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                fontSize: '12px'
                                            }}
                                            cursor={{ stroke: '#22534f', strokeWidth: 1.5 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#22534f"
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            strokeWidth={2.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Class Distribution (Pie Chart) */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 flex flex-col">
                            <div className="mb-4">
                                <h4 className="text-foreground font-heading font-bold text-base">Class Distribution</h4>
                                <p className="text-xs text-slate-500">Progress across Pathfinder ranks</p>
                            </div>
                            <div className="h-[260px] w-full flex-1 flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CLUB_PALETTE[index % CLUB_PALETTE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* DATA EXPORT CENTER */}
                    {/* ============================================= */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary mb-1">
                                    Report Generator
                                </span>
                                <h3 className="font-heading text-lg font-bold text-foreground">Data Export Center</h3>
                                <p className="text-xs text-slate-500">Generate segmented CSV datasets formatted for AYM leadership and General Conference audits</p>
                            </div>
                        </div>

                        {/* Export Tabs */}
                        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white">
                            {[
                                { key: 'class', label: 'By Pathfinder Class' },
                                { key: 'category', label: 'By Member Category' },
                                { key: 'status', label: 'By Application Status' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveExportTab(tab.key as 'class' | 'category' | 'status')}
                                    className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${activeExportTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-foreground'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* Export by Class */}
                            {activeExportTab === 'class' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {PATHFINDER_CLASSES.map((cls, idx) => {
                                        const count = classDistData.find(d => d.name === cls)?.count || 0;
                                        const rankCode = cls.substring(0, 2).toUpperCase();
                                        return (
                                            <div
                                                key={cls}
                                                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors bg-white flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md font-bold text-xs"
                                                            style={{
                                                                backgroundColor: `${CLUB_PALETTE[idx % CLUB_PALETTE.length]}15`,
                                                                color: CLUB_PALETTE[idx % CLUB_PALETTE.length]
                                                            }}
                                                        >
                                                            {rankCode}
                                                        </span>
                                                        <span className="text-xl font-heading font-extrabold text-foreground">{count}</span>
                                                    </div>
                                                    <h4 className="font-heading font-bold text-foreground text-sm leading-tight">{cls}</h4>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 mb-4">
                                                        {count === 1 ? '1 enrolled' : `${count} enrolled`}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs font-medium border-slate-200 hover:border-primary hover:bg-primary hover:text-white transition-all"
                                                    onClick={() => handleExportByClass(cls)}
                                                    disabled={count === 0}
                                                >
                                                    ↓ Export CSV
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Export by Category */}
                            {activeExportTab === 'category' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {MEMBERSHIP_CATEGORIES.map((cat, idx) => {
                                        const count = categoryDistData.find(d => d.name === cat)?.count || 0;
                                        const catCode = cat.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
                                        return (
                                            <div
                                                key={cat}
                                                className="rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors bg-white flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span
                                                            className="inline-flex items-center justify-center px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wide"
                                                            style={{
                                                                backgroundColor: `${CLUB_PALETTE[idx % CLUB_PALETTE.length]}15`,
                                                                color: CLUB_PALETTE[idx % CLUB_PALETTE.length]
                                                            }}
                                                        >
                                                            {catCode}
                                                        </span>
                                                        <span className="text-2xl font-heading font-extrabold text-foreground">{count}</span>
                                                    </div>
                                                    <h4 className="font-heading font-bold text-foreground text-base mb-1">{cat}</h4>
                                                    <p className="text-xs text-slate-500 mb-3">
                                                        {count === 1 ? '1 registered candidate' : `${count} registered candidates`}
                                                    </p>
                                                    {(cat === 'Senior Youth' || cat === 'Master Guide') && (
                                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                Ghana Cards: {registrations.filter(r => r.membership.membershipCategory === cat && r.applicant.ghanaCardImage).length}
                                                            </span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                Certs: {registrations.filter(r => r.membership.membershipCategory === cat && r.membership.certificateImage).length}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs font-semibold border-slate-200 hover:border-primary hover:bg-primary hover:text-white transition-all"
                                                    onClick={() => handleExportByCategory(cat)}
                                                    disabled={count === 0}
                                                >
                                                    ↓ Export {cat} Roster
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Export by Status */}
                            {activeExportTab === 'status' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { key: 'pending', label: 'Pending Review', dot: 'bg-amber-500' },
                                        { key: 'approved', label: 'Approved Active', dot: 'bg-emerald-600' },
                                        { key: 'rejected', label: 'Rejected / Archived', dot: 'bg-slate-400' },
                                    ].map((status) => {
                                        const count = registrations.filter(r => r.status === status.key).length;
                                        return (
                                            <div
                                                key={status.key}
                                                className="rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors bg-white flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-xs bg-slate-100 text-slate-700">
                                                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                                            {status.label}
                                                        </span>
                                                        <span className="text-2xl font-heading font-extrabold text-foreground">{count}</span>
                                                    </div>
                                                    <h4 className="font-heading font-bold text-foreground text-base mb-1">{status.label}</h4>
                                                    <p className="text-xs text-slate-500 mb-4">
                                                        {count === 1 ? '1 file on record' : `${count} files on record`}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs font-semibold border-slate-200 hover:border-primary hover:bg-primary hover:text-white transition-all"
                                                    onClick={() => handleExportByStatus(status.key)}
                                                    disabled={count === 0}
                                                >
                                                    ↓ Export {status.label}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Bar Chart + Uniform + Documents */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Membership Category (Bar Chart) */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
                            <h4 className="text-foreground font-heading font-bold text-base mb-1">Cadre Breakdown</h4>
                            <p className="text-xs text-slate-500 mb-4">Distribution by program stage</p>
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#22534f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Uniform Possession (Doughnut) */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                            <div>
                                <h4 className="text-foreground font-heading font-bold text-base mb-1">Uniform Readiness</h4>
                                <p className="text-xs text-slate-500">Dress uniform inspection preparedness</p>
                            </div>
                            <div className="h-[220px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={uniformData}
                                            cx="50%"
                                            cy="50%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={55}
                                            outerRadius={75}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {uniformData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={UNIFORM_COLORS[index % UNIFORM_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-8">
                                    <span className="text-3xl font-heading font-extrabold text-foreground">{uniformReadinessRate}%</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ready for parade</span>
                                </div>
                            </div>
                            <div className="text-center pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-600 font-medium">
                                    {fullUniformCount} of {totalRegistered} members fully compliant
                                </p>
                            </div>
                        </div>

                        {/* Document Verification Stats */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
                            <h4 className="text-foreground font-heading font-bold text-base mb-1">Document Compliance</h4>
                            <p className="text-xs text-slate-500 mb-4">Verification items on file</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-heading font-bold text-xs text-foreground">Investiture Certificates</p>
                                        <p className="text-[11px] text-slate-500">Verified prior honors</p>
                                    </div>
                                    <span className="text-lg font-heading font-extrabold text-primary">{certCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-heading font-bold text-xs text-foreground">Ghana Card IDs</p>
                                        <p className="text-[11px] text-slate-500">Official national identification</p>
                                    </div>
                                    <span className="text-lg font-heading font-extrabold text-slate-700">{ghanaCardCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-heading font-bold text-xs text-foreground">Passports & Headshots</p>
                                        <p className="text-[11px] text-slate-500">Member digital ID profiles</p>
                                    </div>
                                    <span className="text-lg font-heading font-extrabold text-slate-700">{profilePhotoCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geographic Distribution */}
                    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h4 className="text-foreground font-heading font-bold text-base">Constituent Church Attendance</h4>
                                <p className="text-xs text-slate-500">Congregational breakdown within Santasi District</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                                Santasi AYM District
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                {sortedLocations.length > 0 ? sortedLocations.map((loc, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${loc.color}`}>{loc.rank}</span>
                                            <div>
                                                <p className="text-sm font-heading font-bold text-foreground">{loc.name}</p>
                                                <p className="text-[11px] text-slate-500">{loc.district}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-heading font-bold text-foreground">{loc.count}</span>
                                            <p className="text-[10px] text-slate-400">members</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-slate-400 text-sm py-4">No church affiliation data recorded yet.</div>
                                )}
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-heading font-extrabold flex items-center justify-center mb-3 text-sm">
                                    AYM
                                </div>
                                <h5 className="font-heading font-bold text-foreground text-sm">Central District Roster Active</h5>
                                <p className="text-xs text-slate-500 max-w-sm mt-1">
                                    {Object.keys(churchDist).length} fellowship congregations actively reporting membership through the Santasi Pathfinder Management System.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Reports;
