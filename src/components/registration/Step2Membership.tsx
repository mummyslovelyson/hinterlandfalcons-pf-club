import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PATHFINDER_CLASSES, MEMBERSHIP_CATEGORIES } from '@/types/registration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from 'react';

const Step2Membership = () => {
  const { register, watch, setValue } = useFormContext();
  const wasPreviousPathfinder = watch('membership.wasPreviousPathfinder');
  const completedClasses = watch('membership.completedClasses') || [];
  const membershipCategory = watch('membership.membershipCategory');
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const certificateCameraRef = useRef<HTMLInputElement>(null);
  const [certificatePreview, setCertificatePreview] = useState<string>('');

  const handleClassToggle = (className: string, checked: boolean) => {
    const current = completedClasses;
    if (checked) {
      setValue('membership.completedClasses', [...current, className]);
    } else {
      setValue('membership.completedClasses', current.filter((c: string) => c !== className));
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setValue('membership.certificateImage', result);
        setCertificatePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCertificate = () => {
    setValue('membership.certificateImage', '');
    setCertificatePreview('');
  };

  const certificateImage = watch('membership.certificateImage') || certificatePreview;
  const isSeniorOrMasterGuide = membershipCategory === 'Senior Youth' || membershipCategory === 'Master Guide';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Membership Declaration</h2>
        <p className="text-muted-foreground mt-2">
          Share your commitment and Pathfinder experience
        </p>
      </div>

      {/* Membership Category Selection */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="mb-2">
          <h3 className="font-heading text-lg font-semibold text-foreground">Membership Category</h3>
          <p className="text-sm text-muted-foreground">Select the category you are registering for</p>
        </div>

        <Select
          onValueChange={(value) => setValue('membership.membershipCategory', value)}
          defaultValue={membershipCategory}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select your membership category" />
          </SelectTrigger>
          <SelectContent>
            {MEMBERSHIP_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isSeniorOrMasterGuide && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-3">
            <p className="font-semibold text-foreground text-sm">Additional Requirements</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {membershipCategory === 'Master Guide'
                ? 'Master Guides are required to upload their certificate and Ghana Card.'
                : 'Senior Youth members are required to upload their certificate and Ghana Card.'}
            </p>
          </div>
        )}
      </div>

      {/* Certificate Upload - shown for Senior Youth & Master Guide */}
      {isSeniorOrMasterGuide && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-6">
          <div className="mb-2">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {membershipCategory} Leadership Certificate <span className="text-destructive">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">Upload a clear document image of your {membershipCategory} certificate</p>
          </div>

          {certificateImage ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img
                src={certificateImage}
                alt={`${membershipCategory} Certificate`}
                className="w-full max-h-56 object-contain p-2"
              />
              <button
                type="button"
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold text-sm shadow-md hover:bg-destructive/90 transition-colors"
                onClick={removeCertificate}
                aria-label="Remove certificate"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Label htmlFor="certificate-upload" className="cursor-pointer flex-1">
                <div className="flex flex-col items-center gap-1 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 px-4 py-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary transition-colors text-center">
                  <span className="font-semibold text-primary">Upload Certificate</span>
                  <span className="text-xs text-muted-foreground">Browse files from device</span>
                </div>
                <Input
                  id="certificate-upload"
                  ref={certificateInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCertificateUpload}
                />
              </Label>

              <Label htmlFor="certificate-camera" className="cursor-pointer flex-1">
                <div className="flex flex-col items-center gap-1 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 px-4 py-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary transition-colors text-center">
                  <span className="font-semibold text-primary">Take Photo</span>
                  <span className="text-xs text-muted-foreground">Capture with camera</span>
                </div>
                <Input
                  id="certificate-camera"
                  ref={certificateCameraRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCertificateUpload}
                />
              </Label>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Upload a clear image of your official certificate • Max 5MB</p>
        </div>
      )}

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
        <h3 className="font-heading text-lg font-semibold text-foreground">
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

      {/* Primary Pathfinder Class Selection */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="mb-2">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Pathfinder Class / Level <span className="text-destructive">*</span>
          </h3>
          <p className="text-sm text-muted-foreground">Select the primary progressive class you are enrolling into for 2026</p>
        </div>

        <Select
          value={completedClasses[0] || ''}
          onValueChange={(val) => {
            const rest = completedClasses.filter((c: string) => c !== val);
            setValue('membership.completedClasses', [val, ...rest], { shouldValidate: true });
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Choose your Pathfinder Class (e.g. Friend, Companion, Master Guide...)" />
          </SelectTrigger>
          <SelectContent>
            {PATHFINDER_CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {completedClasses[0] && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Selected Class: {completedClasses[0]}
          </div>
        )}
      </div>

      {/* Completed Classes */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Previously Completed Classes (Optional)
        </h3>
        <p className="text-sm text-muted-foreground">Check any additional classes you have already completed in past years:</p>

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
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Uniform Availability
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-card">
            <Checkbox
              id="hasFullDressUniform"
              checked={watch('membership.hasFullDressUniform')}
              onCheckedChange={(checked) => setValue('membership.hasFullDressUniform', checked)}
            />
            <Label htmlFor="hasFullDressUniform" className="cursor-pointer">
              I have a full dress uniform
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-card">
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
