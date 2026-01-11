import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import ApplicationCard from '@/components/admin/ApplicationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRegistrations } from '@/lib/storage';
import { Registration } from '@/types/registration';
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const Applications = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchRegistrations = () => {
    const data = getRegistrations();
    setRegistrations(data);
  };

  useEffect(() => {
    fetchRegistrations();

    window.addEventListener('storage', fetchRegistrations);
    window.addEventListener('focus', fetchRegistrations);

    return () => {
      window.removeEventListener('storage', fetchRegistrations);
      window.removeEventListener('focus', fetchRegistrations);
    };
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.applicant.church.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.guardian.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filterButtons = [
    { value: 'all', label: 'All', icon: FileText },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'approved', label: 'Approved', icon: CheckCircle2 },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
  ] as const;

  return (
    <>
      <AdminHeader
        title="Applications"
        subtitle={`${registrations.length} total applications`}
      />

      <main className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, church, or guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchRegistrations} className="shrink-0">
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filterButtons.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'whitespace-nowrap',
                  statusFilter === filter.value && 'shadow-soft'
                )}
              >
                <filter.icon className="h-4 w-4 mr-1" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredRegistrations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRegistrations
              .sort((a, b) => {
                const dateA = new Date(a.submittedAt).getTime() || 0;
                const dateB = new Date(b.submittedAt).getTime() || 0;
                return dateB - dateA;
              })
              .map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">
              No Applications Found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Applications will appear here once submitted'}
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default Applications;
