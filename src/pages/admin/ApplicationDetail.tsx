import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import PrintableApplication from '@/components/admin/PrintableApplication';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRegistrationById, updateRegistration, fetchRegistrationById } from '@/lib/registrations';
import { Registration, PATHFINDER_CLASSES } from '@/types/registration';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold',
  },
  approved: {
    label: 'Approved',
    className: 'bg-primary/10 text-primary border-primary/30 font-semibold',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/30 font-semibold',
  },
};

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Registration | null>(null);
  const [notes, setNotes] = useState('');

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (id) {
      const data = getRegistrationById(id);
      if (data) {
        setApplication(data);
        setNotes(data.notes || '');
      }
      fetchRegistrationById(id).then((fresh) => {
        if (fresh) {
          setApplication(fresh);
          setNotes(fresh.notes || '');
        } else if (!data) {
          navigate('/admin/applications');
        }
      });
    }
  }, [id, navigate]);

  if (!application) {
    return null;
  }

  const handleStatusChange = (newStatus: 'approved' | 'rejected') => {
    updateRegistration(application.id, {
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Admin User',
      notes,
    });
    setApplication({ ...application, status: newStatus });
    toast.success(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
  };

  const handleSaveNotes = () => {
    updateRegistration(application.id, { notes });
    toast.success('Notes saved successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = statusConfig[application.status];

  const initials = application.applicant.fullName
    ? application.applicant.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'PF';

  return (
    <>
      <div className="print:hidden">
        <AdminHeader
          title="Application Dossier"
          subtitle={`Submitted ${formatDate(application.submittedAt)}`}
        />
      </div>

      <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-50 print:h-screen print:w-screen">
        <PrintableApplication application={application} />
      </div>

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 print:hidden w-full max-w-7xl mx-auto space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
            <Link to="/admin/applications">
              ← Back to Applications
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn('text-xs px-3 py-1', status.className)}>
              {status.label}
            </Badge>
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs font-semibold">
              Print / Export PDF ↗
            </Button>
          </div>
        </div>

        {/* Dossier Sections */}
        <div className="space-y-6">
          {/* Section 01: Applicant Information */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                01. Applicant Information
              </h2>
              <span className="text-xs text-muted-foreground font-mono">ID: {application.id}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-28 w-28 border-2 border-border flex-shrink-0">
                <AvatarImage src={application.applicant.profileImage} className="object-cover" />
                <AvatarFallback className="text-2xl font-heading font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground">Full Legal Name</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{application.applicant.fullName}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Contact Phone</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{application.applicant.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold text-muted-foreground">Residential Address</p>
                  <p className="text-sm text-foreground mt-0.5">{application.applicant.address}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">School & Classification</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {application.applicant.school}
                    {application.applicant.schoolType && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-muted font-medium text-foreground">
                        {application.applicant.schoolType}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Grade / Academic Level</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{application.applicant.grade}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Date of Birth & Age</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {new Date(application.applicant.dateOfBirth).toLocaleDateString()} (Age {application.applicant.age} yrs)
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Home Church</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{application.applicant.church}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Preferred Club Designation</p>
                  <p className="text-sm font-medium text-primary mt-0.5">{application.applicant.preferredClubName}</p>
                </div>
              </div>
            </div>

            {/* Ghana Card Image */}
            {application.applicant.ghanaCardImage && (
              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-foreground">Ghana Card Identification</p>
                <div className="rounded-lg overflow-hidden border border-border bg-muted/20 max-w-md p-2">
                  <img
                    src={application.applicant.ghanaCardImage}
                    alt="Ghana Card"
                    className="w-full max-h-48 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Section 02: Membership & Curriculum Experience */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                02. Membership & Pathfinder Curriculum
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              {application.membership.membershipCategory && (
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">Membership Category</p>
                  <span className="inline-block px-3 py-1 rounded-md bg-primary text-primary-foreground font-semibold text-xs">
                    {application.membership.membershipCategory}
                  </span>
                </div>
              )}

              {/* Certificate Image */}
              {application.membership.certificateImage && (
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">
                    {application.membership.membershipCategory} Leadership Certificate
                  </p>
                  <div className="rounded-lg overflow-hidden border border-border bg-muted/20 max-w-md p-2">
                    <img
                      src={application.membership.certificateImage}
                      alt="Certificate"
                      className="w-full max-h-56 object-contain rounded"
                    />
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold text-muted-foreground mb-2">Completed Classes</p>
                <div className="flex flex-wrap gap-2">
                  {PATHFINDER_CLASSES.map((cls) => {
                    const isCompleted = Array.isArray(application.membership?.completedClasses) && application.membership.completedClasses.includes(cls);
                    return (
                      <span
                        key={cls}
                        className={`px-2.5 py-1 rounded-md font-semibold text-xs border ${
                          isCompleted
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-muted/40 text-muted-foreground/60 border-border/40'
                        }`}
                      >
                        {isCompleted ? `✓ ${cls}` : cls}
                      </span>
                    );
                  })}
                </div>
              </div>

              {application.membership.honorsEarned && (
                <div>
                  <p className="font-semibold text-muted-foreground">Honors Previously Earned</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{application.membership.honorsEarned}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-border bg-muted/20 flex justify-between items-center">
                  <span className="font-medium text-foreground">Class A Dress Uniform:</span>
                  <span className="font-bold text-primary">
                    {application.membership.hasFullDressUniform ? '✓ Available' : '— Needs Acquisition'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20 flex justify-between items-center">
                  <span className="font-medium text-foreground">Field / Working Uniform:</span>
                  <span className="font-bold text-primary">
                    {application.membership.hasFullFieldUniform ? '✓ Available' : '— Needs Acquisition'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Guardian Information */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                03. Parent / Guardian Information
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground">Parent / Guardian Full Name</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{application.guardian.fullName}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Relationship to Applicant</p>
                <p className="text-sm text-foreground mt-0.5">{application.guardian.relationship}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Emergency Phone</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{application.guardian.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Occupation / Vocation</p>
                <p className="text-sm text-foreground mt-0.5">{application.guardian.occupation || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Master Guide Qualification</p>
                <p className="text-sm text-foreground mt-0.5">
                  {application.guardian.isMasterGuide ? '✓ Certified Master Guide' : 'No'}
                </p>
              </div>
              {application.guardian.areasOfAssistance.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="font-semibold text-muted-foreground mb-1.5">Offered Areas of Club Assistance</p>
                  <div className="flex flex-wrap gap-1.5">
                    {application.guardian.areasOfAssistance.map((area) => (
                      <span key={area} className="px-2 py-0.5 rounded bg-muted font-medium text-foreground text-[11px]">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 04: Consent & Signature */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                04. Consent & Signature Verification
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">✓</span>
                <span className="text-foreground">Acknowledged parental responsibility and club oversight</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">✓</span>
                <span className="text-foreground">Signed medical and activity liability waiver</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">✓</span>
                <span className="text-foreground">Agreed to cooperate with Pathfinder leadership & schedule</span>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="font-semibold text-muted-foreground">Digital Authorization</p>
                {application.consent.signature.startsWith('data:image') ? (
                  <img
                    src={application.consent.signature}
                    alt="Signature"
                    className="h-16 mt-2 border rounded bg-white p-1"
                  />
                ) : (
                  <p className="font-mono text-sm font-bold text-foreground italic mt-1">{application.consent.signature}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Signed on {formatDate(application.consent.signatureDate)}
                </p>
              </div>
            </div>
          </section>

          {/* Section 05: Administrative Notes */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="font-heading text-base font-bold text-foreground">
              05. Administrative Review Notes
            </h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record notes on intake interview, baptism status, uniform readiness, or church confirmation..."
              rows={4}
              className="text-xs"
            />
            <Button onClick={handleSaveNotes} variant="outline" size="sm" className="text-xs font-semibold">
              Save Notes
            </Button>
          </section>

          {/* Review Decision Actions */}
          {application.status === 'pending' && (
            <section className="rounded-xl border border-primary/40 bg-primary/5 p-6 space-y-3">
              <h2 className="font-heading text-base font-bold text-foreground">
                Intake Decision Actions
              </h2>
              <p className="text-xs text-muted-foreground">
                Confirm admission or mark application for verification. Approved candidates will be added to the active membership roster.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => handleStatusChange('approved')} size="sm" className="text-xs font-semibold">
                  ✓ Approve & Enroll Member
                </Button>
                <Button
                  onClick={() => handleStatusChange('rejected')}
                  variant="destructive"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  ✕ Reject Application
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default ApplicationDetail;
