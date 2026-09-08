import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ASSISTANCE_AREAS } from '@/types/registration';

const Step3Guardian = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const areasOfAssistance = watch('guardian.areasOfAssistance') || [];
  const guardianErrors = (errors.guardian || {}) as Record<string, { message?: string }>;

  const handleAreaToggle = (area: string, checked: boolean) => {
    const current = areasOfAssistance;
    if (checked) {
      setValue('guardian.areasOfAssistance', [...current, area]);
    } else {
      setValue('guardian.areasOfAssistance', current.filter((a: string) => a !== area));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Parent/Guardian Information</h2>
        <p className="text-muted-foreground mt-2">Parental approval is required for Pathfinder participation</p>
      </div>

      <div className="rounded-lg border-l-4 border-l-primary border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold text-slate-800 text-sm">Parental Consent Requirement</p>
        <p className="text-sm text-slate-600 mt-0.5">
          Pathfinder enrollment requires signed parental or legal guardian approval. The applicant must be at least 10 years old.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Guardian Details</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="guardianName" className="block text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardianName"
              placeholder="Parent/Guardian full name"
              {...register('guardian.fullName', { required: 'Guardian name is required' })}
              className={guardianErrors.fullName ? 'border-destructive' : ''}
            />
            {guardianErrors.fullName && (
              <p className="text-sm text-destructive">{guardianErrors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="block text-sm font-medium text-foreground">
              Relationship to Applicant <span className="text-destructive">*</span>
            </Label>
            <Input
              id="relationship"
              placeholder="e.g., Mother, Father, Guardian"
              {...register('guardian.relationship', { required: 'Relationship is required' })}
              className={guardianErrors.relationship ? 'border-destructive' : ''}
            />
            {guardianErrors.relationship && (
              <p className="text-sm text-destructive">{guardianErrors.relationship.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone" className="block text-sm font-medium text-foreground">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardianPhone"
              type="tel"
              placeholder="e.g. 024 123 4567"
              {...register('guardian.phone', { required: 'Phone number is required' })}
              className={guardianErrors.phone ? 'border-destructive' : ''}
            />
            {guardianErrors.phone && (
              <p className="text-sm text-destructive">{guardianErrors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="block text-sm font-medium text-foreground">
              Occupation
            </Label>
            <Input id="occupation" placeholder="Your occupation" {...register('guardian.occupation')} />
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-card mt-4">
          <Checkbox
            id="isMasterGuide"
            checked={watch('guardian.isMasterGuide')}
            onCheckedChange={(checked) => setValue('guardian.isMasterGuide', checked)}
          />
          <Label htmlFor="isMasterGuide" className="cursor-pointer font-medium">
            I am a certified Master Guide
          </Label>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Prior Pathfinder Involvement</h3>
        <Textarea
          placeholder="Describe any prior involvement with Pathfinder activities..."
          {...register('guardian.priorInvolvement')}
          rows={3}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Areas of Assistance
        </h3>
        <p className="text-sm text-muted-foreground">Select areas where you would be willing to help:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ASSISTANCE_AREAS.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox
                id={`area-${area}`}
                checked={areasOfAssistance.includes(area)}
                onCheckedChange={(checked) => handleAreaToggle(area, checked as boolean)}
              />
              <Label htmlFor={`area-${area}`} className="cursor-pointer text-sm">{area}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3Guardian;
