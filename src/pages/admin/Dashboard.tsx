import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import ApplicationCard from '@/components/admin/ApplicationCard';
import { Button } from '@/components/ui/button';
import { getRegistrations } from '@/lib/storage';
import { Registration } from '@/types/registration';
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const fetchRegistrations = () => {
    const data = getRegistrations();
    setRegistrations(data);
  };

  useEffect(() => {
    fetchRegistrations();

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', fetchRegistrations);

    // Listen for focus (tab switch)
    window.addEventListener('focus', fetchRegistrations);

    return () => {
      window.removeEventListener('storage', fetchRegistrations);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, []);

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  const recentApplications = registrations
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 4);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of Santasi SDA Pathfinder Club activities."
      />

      <main className="flex-1 overflow-auto p-6 bg-muted/30">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Club Overview</h2>
            <p className="text-muted-foreground">Manage your members and applications efficiently.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRegistrations}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-0 fill-mode-both">
            <StatsCard
              title="Total Applications"
              value={stats.total}
              icon={FileText}
              variant="primary"
              description="Lifetime submissions"
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <StatsCard
              title="Pending Review"
              value={stats.pending}
              icon={Clock}
              variant="accent"
              description="Requires attention"
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <StatsCard
              title="Approved Members"
              value={stats.approved}
              icon={CheckCircle2}
              variant="success"
              description="Active in club"
              trend={{ value: 5, isPositive: true }}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <StatsCard
              title="Total Members"
              value={stats.approved}
              icon={Users}
              description="Registered Pathfinders"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-7 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {/* Recent Applications */}
          <div className="md:col-span-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">Recent Applications</h3>
                <p className="text-sm text-muted-foreground">Latest incoming registrations</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/admin/applications">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="p-6">
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application, index) => (
                    <div
                      key={application.id}
                      className="group flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {application.applicant.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{application.applicant.fullName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(application.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${application.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          application.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/applications/${application.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">New submissions will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Tips Side */}
          <div className="md:col-span-3 space-y-6">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6">
              <h3 className="font-heading text-lg font-semibold mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" /> Manage Members
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" /> Review Pending ({stats.pending})
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold mb-4">Registration Status</h3>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-green-900">System Online</p>
                  <p className="text-xs text-green-700">Accepting new applications</p>
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
