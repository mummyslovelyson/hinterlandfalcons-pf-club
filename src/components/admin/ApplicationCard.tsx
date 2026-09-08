import { Link } from 'react-router-dom';
import { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: Registration;
}

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

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const status = statusConfig[application.status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const initials = application.applicant.fullName
    ? application.applicant.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'PF';

  return (
    <div
      className="group rounded-xl border border-slate-200 bg-card p-5 transition-colors duration-150 space-y-4 hover:border-slate-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={application.applicant.profileImage} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              {application.applicant.fullName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Age {application.applicant.age} • {application.applicant.grade}
              {application.membership?.membershipCategory && (
                <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                  {application.membership.membershipCategory}
                </span>
              )}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[11px] px-2 py-0.5', status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Church:</span>
          <span className="text-foreground truncate max-w-[180px]">{application.applicant.church}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Club:</span>
          <span className="text-foreground truncate max-w-[180px]">{application.applicant.preferredClubName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-muted-foreground">Applied:</span>
          <span className="text-foreground">{formatDate(application.submittedAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="text-xs">
          <span className="text-muted-foreground">Guardian: </span>
          <span className="text-foreground font-medium">{application.guardian.fullName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold hover:text-primary border-slate-300">
            <Link to={`/admin/applications/${application.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
