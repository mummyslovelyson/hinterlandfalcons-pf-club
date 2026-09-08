import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRegistrationById, fetchRegistrationById } from '@/lib/registrations';
import { Registration } from '@/types/registration';
import { toast } from 'sonner';

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Registration | null>(null);

  useEffect(() => {
    if (id) {
      const data = getRegistrationById(id);
      if (data) {
        setMember(data);
      }
      fetchRegistrationById(id).then((fresh) => {
        if (fresh) {
          setMember(fresh);
        } else if (!data) {
          toast.error('Member record not found');
          navigate('/admin/members');
        }
      });
    }
  }, [id, navigate]);

  if (!member) {
    return (
      <div className="flex-1 p-8 text-center">
        <p className="text-muted-foreground">Loading member record...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <AdminHeader
        title={`${member.applicant.fullName} • Member Dossier`}
        subtitle={`Member ID: ${member.id} • ${member.membership.membershipCategory}`}
      />

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-muted/30">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Navigation & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/members">
                ← Back to All Members
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                Print Member Card
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link to={`/admin/applications/${member.id}`}>
                  View Full Application
                </Link>
              </Button>
            </div>
          </div>

          {/* Member Hero Summary */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border border-border bg-muted/50 flex-shrink-0 flex items-center justify-center font-heading font-bold text-2xl text-primary">
                {member.applicant.profileImage ? (
                  <img
                    src={member.applicant.profileImage}
                    alt={member.applicant.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  member.applicant.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
                    {member.applicant.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Active Member
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {member.membership.membershipCategory}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  {member.applicant.church} • {member.applicant.preferredClubName || 'Hinterland Falcons'} • {member.applicant.grade}
                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-foreground font-medium">
                  <span>Age: <strong>{member.applicant.age} yrs</strong></span>
                  <span>DOB: <strong>{member.applicant.dateOfBirth}</strong></span>
                  <span>Enrolled: <strong>{new Date(member.submittedAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Contact & Guardian */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-heading text-base font-bold text-foreground pb-2 border-b border-border">
                  Personal & Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone Number</span>
                    <a href={`tel:${member.applicant.phone}`} className="font-medium text-primary hover:underline">
                      {member.applicant.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Residential Address</span>
                    <p className="font-medium text-foreground">{member.applicant.address}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">School & Grade</span>
                    <p className="font-medium text-foreground">{member.applicant.school} ({member.applicant.schoolType}) • {member.applicant.grade}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Home Church Congregation</span>
                    <p className="font-medium text-foreground">{member.applicant.church}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-heading text-base font-bold text-foreground pb-2 border-b border-border">
                  Parent / Guardian Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Guardian Name</span>
                    <p className="font-medium text-foreground">{member.guardian.fullName} ({member.guardian.relationship})</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Guardian Phone</span>
                    <a href={`tel:${member.guardian.phone}`} className="font-medium text-primary hover:underline">
                      {member.guardian.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Occupation</span>
                    <p className="font-medium text-foreground">{member.guardian.occupation || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Master Guide Status</span>
                    <p className="font-medium text-foreground">{member.guardian.isMasterGuide ? 'Certified Master Guide' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Pathfinder Curriculum & Uniform */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-heading text-base font-bold text-foreground pb-2 border-b border-border">
                  Curriculum & Class Progression
                </h3>
                
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Completed Progressive Classes</span>
                  {member.membership.completedClasses && member.membership.completedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {member.membership.completedClasses.map((cls) => (
                        <Badge key={cls} variant="secondary" className="px-3 py-1 text-xs font-semibold">
                          ✓ {cls}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Currently enrolled in foundational curriculum.</p>
                  )}
                </div>

                <div className="pt-2">
                  <span className="text-xs text-muted-foreground block mb-1">Honors & Specialties Earned</span>
                  <p className="text-sm font-medium text-foreground">
                    {member.membership.honorsEarned || 'No prior honors recorded.'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-heading text-base font-bold text-foreground pb-2 border-b border-border">
                  Uniform & Equipment Status
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground block">Full Dress Uniform</span>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {member.membership.hasFullDressUniform ? '✓ Available' : 'Needs Ordering'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border bg-secondary/30">
                    <span className="text-xs text-muted-foreground block">Full Field Uniform</span>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {member.membership.hasFullFieldUniform ? '✓ Available' : 'Needs Ordering'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/uniform-request">
                      Submit Uniform Fabric Request →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MemberDetail;
