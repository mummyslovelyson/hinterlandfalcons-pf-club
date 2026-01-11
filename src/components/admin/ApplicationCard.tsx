import { Link } from 'react-router-dom';
import { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: Registration;
}

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

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const status = statusConfig[application.status];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={application.applicant.profileImage} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-heading font-semibold text-foreground">
              {application.applicant.fullName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Age {application.applicant.age} • {application.applicant.grade}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn('flex items-center gap-1', status.className)}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Church:</span>
          <span>{application.applicant.church}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Club:</span>
          <span>{application.applicant.preferredClubName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Applied {formatDate(application.submittedAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-sm">
          <span className="text-muted-foreground">Guardian: </span>
          <span className="text-foreground">{application.guardian.fullName}</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/admin/applications/${application.id}`}>
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ApplicationCard;
