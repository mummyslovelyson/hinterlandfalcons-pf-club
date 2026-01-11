import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { getRegistrations } from '@/lib/storage';
import { Registration } from '@/types/registration';
import {
    Users,
    CheckCircle2,
    UserPlus,
    Shirt,
    MoreHorizontal,
    Map as MapIcon,
    MapPin,
    Download
} from 'lucide-react';
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
    Legend
} from 'recharts';

const Reports = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    useEffect(() => {
        const data = getRegistrations();
        setRegistrations(data);
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

    // 1. Trends Data (Last 12 Months - simplified to Jan-Dec for demo stability)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const trendsData = months.map((month, index) => {
        const count = registrations.filter(r => new Date(r.submittedAt).getMonth() === index).length;
        return { name: month, count };
    });

    // 2. Class Distribution Data
    const classDist: Record<string, number> = {
        Friend: 0,
        Companion: 0,
        Explorer: 0,
        Ranger: 0,
        Voyager: 0,
        Guide: 0
    };

    registrations.forEach(r => {
        const grade = parseInt(r.applicant.grade);
        if (!isNaN(grade)) {
            if (grade <= 6) classDist.Friend++;
            else if (grade === 7) classDist.Companion++;
            else if (grade === 8) classDist.Explorer++;
            else if (grade === 9) classDist.Ranger++;
            else if (grade === 10) classDist.Voyager++;
            else if (grade >= 11) classDist.Guide++;
        } else {
            classDist.Friend++;
        }
    });

    const pieData = Object.entries(classDist)
        .filter(([, count]) => count > 0) // Only show active classes
        .map(([name, value]) => ({ name, value }));

    // If no data, provide placeholder
    if (pieData.length === 0) {
        pieData.push({ name: 'No Data', value: 1 });
    }

    const COLORS = ['#137fec', '#f97316', '#a855f7', '#06b6d4', '#2563ea', '#10b981'];

    // 3. Uniform Readiness Doughtnut Data
    const uniformData = [
        { name: 'Full Uniform', value: fullUniformCount },
        { name: 'Incomplete', value: totalRegistered - fullUniformCount }
    ];
    // Placeholder if empty
    if (totalRegistered === 0) {
        uniformData[1].value = 1;
    }
    const UNIFORM_COLORS = ['#137fec', '#e2e8f0'];

    // --- Geographic Distribution ---
    const churchDist: Record<string, number> = {};
    registrations.forEach(r => {
        const church = r.applicant.church || 'Unknown';
        churchDist[church] = (churchDist[church] || 0) + 1;
    });

    const sortedLocations = Object.entries(churchDist)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, count], idx) => ({
            rank: String(idx + 1).padStart(2, '0'),
            name,
            district: 'Central District',
            count,
            color: idx === 0 ? 'text-primary' : 'text-muted-foreground'
        }));

    return (
        <>
            <AdminHeader
                title="Analytics Dashboard"
                subtitle="Real-time insights from your registration data."
            />

            <div className="flex-1 overflow-auto bg-muted/30 p-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Actions Row */}
                    <div className="flex justify-end gap-3">
                        <Button size="sm" variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                        <StatsCard
                            title="Total Registered"
                            value={totalRegistered}
                            icon={Users}
                            variant="primary"
                            trend={{ value: 12, isPositive: true }}
                        />
                        <StatsCard
                            title="Completion Rate"
                            value={`${completionRate}%`}
                            icon={CheckCircle2}
                            variant="success"
                        />
                        <StatsCard
                            title="New Members"
                            value={`+${newMembersCount}`}
                            icon={UserPlus}
                            variant="accent"
                            description="This Month"
                        />
                        <StatsCard
                            title="Uniform Readiness"
                            value={`${uniformReadinessRate}%`}
                            icon={Shirt}
                            variant="default"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">

                        {/* Registration Trends (Area Chart) - Spans 2 cols */}
                        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-foreground font-bold">Registration Overview</h4>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#137fec" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#137fec" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            cursor={{ stroke: '#137fec', strokeWidth: 1 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#137fec"
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Class Distribution (Pie Chart) - Spans 1 col */}
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h4 className="text-foreground font-bold mb-4">Class Distribution</h4>
                            <div className="h-[300px] w-full flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">

                        {/* Uniform Possession (Doughnut) */}
                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                            <h4 className="text-foreground font-bold mb-2">Uniform Readiness</h4>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={uniformData}
                                            cx="50%"
                                            cy="50%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {uniformData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={UNIFORM_COLORS[index % UNIFORM_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-10">
                                    <span className="text-3xl font-black text-foreground">{uniformReadinessRate}%</span>
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ready</span>
                                </div>
                                <div className="text-center -mt-4">
                                    <p className="text-sm text-muted-foreground">{fullUniformCount} of {totalRegistered} members fully equipped</p>
                                </div>
                            </div>
                        </div>

                        {/* Geographic Distribution (List & Map Placeholder) - Spans 2 cols */}
                        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-foreground font-bold">Top Locations</h4>
                                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary/80 transition-colors">
                                    <MapIcon className="h-4 w-4" />
                                    View Map
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    {sortedLocations.length > 0 ? sortedLocations.map((loc, idx) => (
                                        <div key={idx} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between border border-border">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-black ${loc.color}`}>{loc.rank}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{loc.name}</p>
                                                    <p className="text-xs text-muted-foreground">{loc.district}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-foreground">{loc.count}</span>
                                        </div>
                                    )) : (
                                        <div className="text-muted-foreground text-sm py-4">No location data available yet.</div>
                                    )}
                                </div>

                                <div className="relative min-h-[200px] bg-muted rounded-xl overflow-hidden flex items-center justify-center border border-border">
                                    <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhe44c1wfTjne6P96lGk4MiqsOgyL3bEBRRox4d7XqMpxHC_NhC3-wekJNFoyMlEZ_CLU0dX_mbOi_5r1-zKXP56a3YB2WP80YsTeOwlXE9LQYShIIfG9cQKdDfec6hVSKOsY-RRscrVWhOMZhUa1Szvfr_-BtJj9RNqcJ95V-hU8cBEOCkc6GPrISnMYn0jXMwFDCAf3pwQLfVKW1zU-Japl9viCuP07VR5A6hnZd0RRGk4kVyyGnv0L2vASZFaTWI_M8hDEwuAU')" }}></div>
                                    <div className="relative z-10 text-center p-6 backdrop-blur-sm bg-white/60 rounded-xl border border-white/50 shadow-sm">
                                        <MapPin className="text-primary h-12 w-12 mx-auto mb-2" />
                                        <p className="text-lg font-bold text-foreground">Regional Presence</p>
                                        <p className="text-sm text-muted-foreground">{Object.keys(churchDist).length} clubs active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
