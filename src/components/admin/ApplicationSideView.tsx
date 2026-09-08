import { Registration } from '@/types/registration';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationSideViewProps {
  application: Registration | null;
  onClose: () => void;
  onStatusChange: (id: string, status: Registration['status']) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<Registration['status'], { label: string; bg: string; icon: typeof Clock }> = {
  pending: { label: 'Under Review', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
};

export const ApplicationSideView = ({
  application,
  onClose,
  onStatusChange,
  onDelete,
}: ApplicationSideViewProps) => {
  if (!application) return null;

  const statusInfo = statusConfig[application.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-heading font-bold text-slate-900">Application Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 overflow-y-auto space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={application.applicant.profileImage} />
            <AvatarFallback>{application.applicant.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-slate-900">{application.applicant.fullName}</h4>
            <p className="text-xs text-slate-500">{application.applicant.church}</p>
          </div>
        </div>

        <div className="pt-2">
          <Badge className={statusInfo.bg}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div><span className="font-medium text-slate-400">Phone:</span> {application.applicant.phone}</div>
          <div><span className="font-medium text-slate-400">Category:</span> {application.membership.membershipCategory}</div>
          <div><span className="font-medium text-slate-400">Guardian:</span> {application.guardian.fullName} ({application.guardian.phone})</div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            onClick={() => onStatusChange(application.id, 'approved')}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
            onClick={() => onStatusChange(application.id, 'rejected')}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => onDelete(application.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSideView;
