import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import PrintableApplication from '@/components/admin/PrintableApplication';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRegistrationById, updateRegistration } from '@/lib/storage';
import { Registration, PATHFINDER_CLASSES } from '@/types/registration';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  User,
  Phone,
  MapPin,
  School,
  Church,
  Calendar,
  Award,
  Shirt,
  Users,
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Printer
} from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-accent/10 text-accent border-accent/30',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
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
      } else {
        navigate('/admin/applications');
      }
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
  const StatusIcon = status.icon;

  return (
    <>
      <div className="print:hidden">
        <AdminHeader
          title="Application Details"
          subtitle={`Submitted ${formatDate(application.submittedAt)}`}
        />
      </div>

      <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-50 print:h-screen print:w-screen">
        <PrintableApplication application={application} />
      </div>

      <main className="flex-1 overflow-auto p-6 print:hidden">
        <div className="max-w-4xl mx-auto">
          {/* Back Button & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn('flex items-center gap-1 px-3 py-1', status.className)}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </Badge>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print / PDF
              </Button>
            </div>
          </div>

          {/* Application Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
            {/* Applicant Information */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                Applicant Information
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32 border-4 border-muted">
                  <AvatarImage src={application.applicant.profileImage} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-muted/50">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{application.applicant.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium text-foreground">{application.applicant.phone}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="font-medium text-foreground">{application.applicant.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <School className="h-3 w-3" /> School
                    </p>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {application.applicant.school}
                      {application.applicant.schoolType && (
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {application.applicant.schoolType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade / Level</p>
                    <p className="font-medium text-foreground">{application.applicant.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date of Birth
                    </p>
                    <p className="font-medium text-foreground">
                      {new Date(application.applicant.dateOfBirth).toLocaleDateString()} (Age {application.applicant.age})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Church className="h-3 w-3" /> Church
                    </p>
                    <p className="font-medium text-foreground">{application.applicant.church}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Preferred Club
                    </p>
                    <p className="font-medium text-foreground">{application.applicant.preferredClubName}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Membership Information */}
            <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                Membership Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Completed Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {PATHFINDER_CLASSES.map((cls) => (
                      <Badge
                        key={cls}
                        variant={application.membership.completedClasses.includes(cls) ? 'default' : 'outline'}
                        className={application.membership.completedClasses.includes(cls) ? '' : 'opacity-50'}
                      >
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>

                {application.membership.honorsEarned && (
                  <div>
                    <p className="text-sm text-muted-foreground">Honors Earned</p>
                    <p className="font-medium text-foreground">{application.membership.honorsEarned}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Dress Uniform: {application.membership.hasFullDressUniform ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Field Uniform: {application.membership.hasFullFieldUniform ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Guardian Information */}
            <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                Guardian Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground">{application.guardian.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium text-foreground">{application.guardian.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{application.guardian.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-medium text-foreground">{application.guardian.occupation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Master Guide</p>
                  <p className="font-medium text-foreground">{application.guardian.isMasterGuide ? 'Yes' : 'No'}</p>
                </div>
                {application.guardian.areasOfAssistance.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Areas of Assistance</p>
                    <div className="flex flex-wrap gap-2">
                      {application.guardian.areasOfAssistance.map((area) => (
                        <Badge key={area} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Consent Information */}
            <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-both">
              <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <FileCheck className="h-5 w-5 text-primary" />
                Consent & Signature
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Acknowledged responsibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Waived claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Agreed to cooperate</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Digital Signature</p>
                  {application.consent.signature.startsWith('data:image') ? (
                    <img
                      src={application.consent.signature}
                      alt="Signature"
                      className="h-16 mt-2 border rounded"
                    />
                  ) : (
                    <p className="font-medium text-foreground italic">{application.consent.signature}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Signed on {formatDate(application.consent.signatureDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* Admin Notes */}
            <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                Admin Notes
              </h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={4}
              />
              <Button onClick={handleSaveNotes} variant="outline" size="sm" className="mt-3">
                Save Notes
              </Button>
            </section>

            {/* Actions */}
            {application.status === 'pending' && (
              <section className="rounded-xl border-2 border-primary bg-primary/5 p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600 fill-mode-both">
                <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Review Actions
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Review the application details above and take action below.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => handleStatusChange('approved')} variant="success">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button onClick={() => handleStatusChange('rejected')} variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ApplicationDetail;
