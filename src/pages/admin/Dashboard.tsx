import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRegistrations, REGISTRATIONS_SYNC_EVENT } from '@/lib/registrations';
import { getChurches, getChurchMembers, CHURCHES_SYNC_EVENT, CHURCH_MEMBERS_SYNC_EVENT } from '@/lib/churches';
import { Registration } from '@/types/registration';
import { FileText, Clock, Users, Shirt } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchRegistrations = () => {
    const data = getRegistrations();
    setRegistrations(data);
  };

  const handleRefresh = () => {
    fetchRegistrations();
    toast.success('Dashboard data refreshed');
  };

  useEffect(() => {
    fetchRegistrations();

    // Listen for live data sync events
    window.addEventListener(REGISTRATIONS_SYNC_EVENT, fetchRegistrations);
    window.addEventListener(CHURCHES_SYNC_EVENT, fetchRegistrations);
    window.addEventListener(CHURCH_MEMBERS_SYNC_EVENT, fetchRegistrations);

    // Listen for focus (tab switch)
    window.addEventListener('focus', fetchRegistrations);

    return () => {
      window.removeEventListener(REGISTRATIONS_SYNC_EVENT, fetchRegistrations);
      window.removeEventListener(CHURCHES_SYNC_EVENT, fetchRegistrations);
      window.removeEventListener(CHURCH_MEMBERS_SYNC_EVENT, fetchRegistrations);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      navigate('/admin/members');
      return;
    }
    navigate(`/admin/members?search=${encodeURIComponent(query)}`);
    toast.info(`Searching records for "${query}"`);
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  const recentApplications = registrations
    .slice()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 4);

  return (
    <>
      <AdminHeader
        title="Command Dashboard"
        subtitle="Santasi AYM Pathfinder District Administration & Real-Time Roster Telemetry."
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Welcome & Live Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                AYM
              </span>
              <div>
                <h2 className="font-heading font-bold text-sm text-foreground">Hinterland Falcons Operational Command</h2>
                <p className="text-xs text-slate-500">Real-time sync active across all district stations</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex-1 sm:flex-none text-xs font-semibold border-slate-200 hover:bg-slate-50 hover:text-primary h-9"
              >
                ↻ Refresh Live Data
              </Button>
              <Button
                size="sm"
                asChild
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9"
              >
                <Link to="/admin/applications">
                  Review Intake ({stats.pending})
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Bar on Dashboard Overview */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Input
                  placeholder="Search club registry by member name, church, guardian, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 text-xs border-slate-200 w-full bg-slate-50/50 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-10 px-5 w-full sm:w-auto"
                >
                  Search Registry
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/members')}
                  className="text-xs font-semibold border-slate-200 hover:bg-slate-50 h-10 px-4 w-full sm:w-auto"
                >
                  Active Directory
                </Button>
              </div>
            </form>
          </div>

          {/* Stats Grid - All Clickable */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/applications" className="block">
              <StatsCard
                title="Total Applications"
                value={stats.total}
                icon={FileText}
                description="Lifetime submissions • Click to view"
                trend={{ value: 12, isPositive: true }}
              />
            </Link>
            <Link to="/admin/applications" className="block">
              <StatsCard
                title="Pending Intake"
                value={stats.pending}
                icon={Clock}
                description="Requires review • Click to review"
              />
            </Link>
            <Link to="/admin/members" className="block">
              <StatsCard
                title="Active Roster"
                value={stats.approved}
                icon={Users}
                description="Inducted pathfinders • Click to view"
                trend={{ value: 5, isPositive: true }}
              />
            </Link>
            <Link to="/admin/uniform-requests" className="block">
              <StatsCard
                title="Regalia Supply"
                value={`${Math.round((registrations.filter(r => r.membership?.hasFullDressUniform).length / (stats.total || 1)) * 100)}%`}
                icon={Shirt}
                description="Uniform readiness rate • Click to manage"
              />
            </Link>
          </div>

          {/* Church Portal & Network Telemetry */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Constituent Fellowship Network
                </span>
                <h3 className="font-heading text-base font-bold text-foreground mt-1">Santasi District Church Portal</h3>
                <p className="text-xs text-slate-500">Autonomous portals for church club directors and local clerks</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs font-semibold border-slate-200">
                <Link to="/church/login" target="_blank">
                  Open Portal →
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const churches = getChurches();
                const allMembers = getChurchMembers();
                const activeMembers = allMembers.filter(m => m.status === 'active');
                return (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                      <p className="text-[11px] text-slate-500 font-medium">Affiliated Churches</p>
                      <p className="text-2xl font-heading font-extrabold text-foreground mt-0.5">{churches.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                      <p className="text-[11px] text-slate-500 font-medium">Parish Members</p>
                      <p className="text-2xl font-heading font-extrabold text-foreground mt-0.5">{allMembers.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                      <p className="text-[11px] text-slate-500 font-medium">Active Communicants</p>
                      <p className="text-2xl font-heading font-extrabold text-primary mt-0.5">{activeMembers.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                      <p className="text-[11px] text-slate-500 font-medium">District Coverage</p>
                      <p className="text-2xl font-heading font-extrabold text-slate-700 mt-0.5">100%</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-7">
            {/* Recent Applications */}
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">Recent Intake</h3>
                  <p className="text-xs text-slate-500">Latest online registration submissions</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80">
                  <Link to="/admin/applications">
                    View All →
                  </Link>
                </Button>
              </div>

              <div className="p-5">
                {recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.map((application) => {
                      const initials = application.applicant.fullName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={application.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-slate-50/60 transition-all gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-heading font-bold text-foreground text-sm leading-tight truncate">{application.applicant.fullName}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {application.applicant.church} • {new Date(application.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              application.status === 'approved'
                                ? 'bg-primary/10 text-primary'
                                : application.status === 'rejected'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-500/10 text-amber-700'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                application.status === 'approved'
                                  ? 'bg-primary'
                                  : application.status === 'rejected'
                                  ? 'bg-slate-500'
                                  : 'bg-amber-500'
                              }`} />
                              {application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                            <Button asChild size="sm" variant="ghost" className="h-8 text-xs font-semibold hover:text-primary">
                              <Link to={`/admin/applications/${application.id}`}>
                                Review →
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="font-heading font-bold text-sm text-foreground">No applications logged yet</p>
                    <p className="text-xs text-slate-500 mt-1">New submissions via the online registration form will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Management Hub Links */}
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-heading text-base font-bold text-foreground mb-1">Administrative Operations</h3>
                <p className="text-xs text-slate-500 mb-4">Direct shortcuts to club management consoles</p>
                <div className="space-y-1.5">
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/members">
                      <span>Club Members Directory</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/applications">
                      <span>Intake & Applications ({stats.pending})</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/attendance">
                      <span>Parade & Drill Attendance</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/uniform-requests">
                      <span>Uniform & Regalia Supply</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/churches">
                      <span>Constituent Churches Roster</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/curriculum">
                      <span>Curriculum & Investiture Honors</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/finances">
                      <span>Dues & Financial Ledger</span>
                      <span>→</span>
                    </Link>
                  </Button>
                  <Button className="w-full justify-between h-9 text-xs font-medium border-slate-200 hover:border-primary hover:text-primary" variant="outline" asChild>
                    <Link to="/admin/reports">
                      <span>Analytics & CSV Data Engine</span>
                      <span>→</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Status Notice */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-xs font-heading font-bold text-foreground">District Portal Operational</p>
                  <p className="text-[11px] text-slate-500">Registration gateway live for 2026 intake cycle.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default Dashboard;
