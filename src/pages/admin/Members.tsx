import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { getRegistrations } from '@/lib/storage';
import { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users,
  Mail,
  Phone
} from 'lucide-react';

const Members = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const data = getRegistrations();
    setRegistrations(data.filter(r => r.status === 'approved'));
  }, []);

  const filteredMembers = registrations.filter((reg) =>
    reg.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.applicant.church.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminHeader 
        title="Members" 
        subtitle={`${registrations.length} approved members`}
      />
      
      <main className="flex-1 overflow-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Members Table */}
        {filteredMembers.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Age</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Church</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Club</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Classes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Guardian</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{member.applicant.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.applicant.grade}</p>
                      </td>
                      <td className="px-6 py-4 text-foreground">{member.applicant.age}</td>
                      <td className="px-6 py-4 text-foreground">{member.applicant.church}</td>
                      <td className="px-6 py-4 text-foreground">{member.applicant.preferredClubName}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.membership.completedClasses.slice(0, 2).map((cls) => (
                            <Badge key={cls} variant="secondary" className="text-xs">
                              {cls}
                            </Badge>
                          ))}
                          {member.membership.completedClasses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.membership.completedClasses.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{member.guardian.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.guardian.relationship}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
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
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">
              No Members Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Approved applications will appear here as members
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default Members;
