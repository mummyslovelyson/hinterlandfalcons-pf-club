import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PATHFINDER_CLASSES } from '@/types/registration';
import { Award, Shirt, History } from 'lucide-react';

const Step2Membership = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const wasPreviousPathfinder = watch('membership.wasPreviousPathfinder');
  const completedClasses = watch('membership.completedClasses') || [];

  const handleClassToggle = (className: string, checked: boolean) => {
    const current = completedClasses;
    if (checked) {
      setValue('membership.completedClasses', [...current, className]);
    } else {
      setValue('membership.completedClasses', current.filter((c: string) => c !== className));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Membership Declaration</h2>
        <p className="text-muted-foreground mt-2">
          Share your commitment and Pathfinder experience
        </p>
      </div>

      {/* Confirmation Checkboxes */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Membership Commitment</h3>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="confirmJoining"
            checked={watch('membership.confirmJoining')}
            onCheckedChange={(checked) => setValue('membership.confirmJoining', checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="confirmJoining" className="cursor-pointer">
              I confirm my intention to join the Pathfinder Club <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              I understand the commitment required for membership
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreesToParticipate"
            checked={watch('membership.agreesToParticipate')}
            onCheckedChange={(checked) => setValue('membership.agreesToParticipate', checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="agreesToParticipate" className="cursor-pointer">
              I agree to participate in meetings, camping, outreach activities, and other club programs <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Regular attendance and participation is expected
            </p>
          </div>
        </div>
      </div>

      {/* Previous Pathfinder Experience */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Previous Experience
        </h3>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="wasPreviousPathfinder"
            checked={wasPreviousPathfinder}
            onCheckedChange={(checked) => setValue('membership.wasPreviousPathfinder', checked)}
          />
          <Label htmlFor="wasPreviousPathfinder" className="cursor-pointer">
            I was previously a Pathfinder
          </Label>
        </div>

        {wasPreviousPathfinder && (
          <div className="ml-6 space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="previousClubName">Previous Club Name</Label>
              <Input
                id="previousClubName"
                placeholder="Enter your former club name"
                {...register('membership.previousClubName')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Completed Classes */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Completed Pathfinder Classes
        </h3>
        <p className="text-sm text-muted-foreground">Select all classes you have already completed:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PATHFINDER_CLASSES.map((className) => (
            <div key={className} className="flex items-center space-x-2">
              <Checkbox
                id={`class-${className}`}
                checked={completedClasses.includes(className)}
                onCheckedChange={(checked) => handleClassToggle(className, checked as boolean)}
              />
              <Label htmlFor={`class-${className}`} className="cursor-pointer text-sm">
                {className}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Honors Earned */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Honors Earned</h3>
        <Textarea
          placeholder="List any honors you have previously earned (e.g., First Aid, Camping, Bible Study...)"
          {...register('membership.honorsEarned')}
          rows={3}
        />
      </div>

      {/* Uniform Status */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          <Shirt className="h-5 w-5 text-primary" />
          Uniform Availability
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50">
            <Checkbox
              id="hasFullDressUniform"
              checked={watch('membership.hasFullDressUniform')}
              onCheckedChange={(checked) => setValue('membership.hasFullDressUniform', checked)}
            />
            <Label htmlFor="hasFullDressUniform" className="cursor-pointer">
              I have a full dress uniform
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary/50">
            <Checkbox
              id="hasFullFieldUniform"
              checked={watch('membership.hasFullFieldUniform')}
              onCheckedChange={(checked) => setValue('membership.hasFullFieldUniform', checked)}
            />
            <Label htmlFor="hasFullFieldUniform" className="cursor-pointer">
              I have a full field uniform
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Membership;
