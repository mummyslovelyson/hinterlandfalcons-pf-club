import { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Phone, MapPin } from 'lucide-react';

interface MemberSideViewProps {
  member: Registration | null;
  onClose: () => void;
  onEdit: (member: Registration) => void;
  onDelete: (id: string) => void;
}

export const MemberSideView = ({
  member,
  onClose,
  onEdit,
  onDelete,
}: MemberSideViewProps) => {
  if (!member) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-heading font-bold text-slate-900">Member Dossier</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 overflow-y-auto space-y-4 text-xs">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-slate-200">
            <AvatarImage src={member.applicant.profileImage} />
            <AvatarFallback>{member.applicant.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-sm text-slate-900">{member.applicant.fullName}</h4>
            <p className="text-slate-500">{member.applicant.church}</p>
            <Badge variant="outline" className="mt-1 text-[10px]">
              {member.membership.membershipCategory}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-2 text-slate-700">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{member.applicant.phone}</span>
          </div>
          {member.applicant.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{member.applicant.address}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button size="sm" variant="outline" className="text-xs" onClick={() => onEdit(member)}>
            Edit Member
          </Button>
          <Button size="sm" variant="destructive" className="text-xs" onClick={() => onDelete(member.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberSideView;
