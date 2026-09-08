import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateAge } from '@/lib/registrations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useState, useEffect } from 'react';
import { getChurches, syncChurchesFromBackend } from '@/lib/churches';
import { cn } from '@/lib/utils';

const Step1PersonalInfo = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const dateOfBirth = watch('applicant.dateOfBirth');
  const applicantErrors = (errors.applicant || {}) as Record<string, { message?: string }>;
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ghanaCardInputRef = useRef<HTMLInputElement>(null);
  const ghanaCardCameraRef = useRef<HTMLInputElement>(null);
  const membershipCategory = watch('membership.membershipCategory');
  const [ghanaCardPreview, setGhanaCardPreview] = useState<string>('');
  const [churchSuggestions, setChurchSuggestions] = useState<string[]>(() => {
    const init = getChurches();
    return init.length > 0 ? init.map(c => c.name) : [];
  });
  const [isCustomChurch, setIsCustomChurch] = useState(false);

  useEffect(() => {
    syncChurchesFromBackend().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setChurchSuggestions(data.map((c) => c.name));
      }
    });
    const stored = getChurches();
    if (stored && stored.length > 0) {
      setChurchSuggestions(stored.map((c) => c.name));
    }
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setValue('applicant.dateOfBirth', dob);
    if (dob) {
      const age = calculateAge(dob);
      setValue('applicant.age', age);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('applicant.profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGhanaCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setValue('applicant.ghanaCardImage', result);
        setGhanaCardPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('applicant.profileImage', '');
  };

  const removeGhanaCard = () => {
    setValue('applicant.ghanaCardImage', '');
    setGhanaCardPreview('');
  };

  const profileImage = watch('applicant.profileImage');
  const ghanaCardImage = watch('applicant.ghanaCardImage') || ghanaCardPreview;

  const isSeniorOrMasterGuide = membershipCategory === 'Senior Youth' || membershipCategory === 'Master Guide';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Personal Information</h2>
        <p className="text-muted-foreground mt-2">Please provide the applicant's details below</p>
      </div>

      {/* Profile Image Upload with Camera Support */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="text-center mb-2">
          <span className="text-sm font-semibold text-foreground">
            Passport Photo / Picture <span className="text-destructive">* (Mandatory)</span>
          </span>
          <p className="text-xs text-muted-foreground">
            A clear photo is required for your official Pathfinder ID badge
          </p>
        </div>

        <div className="relative">
          <Avatar className={cn(
            "w-32 h-32 border-4 transition-all",
            profileImage ? "border-emerald-500 shadow-md" : "border-amber-400 border-dashed bg-amber-50/50"
          )}>
            <AvatarImage src={profileImage} className="object-cover" />
            <AvatarFallback className="text-xs font-heading font-bold bg-slate-100 text-slate-500 flex flex-col items-center justify-center p-2 text-center">
              <span>PHOTO REQUIRED</span>
            </AvatarFallback>
          </Avatar>
          {profileImage && (
            <button
              type="button"
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold text-sm shadow-md hover:bg-destructive/90 transition-colors"
              onClick={removeImage}
              aria-label="Remove photo"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {/* Upload from gallery */}
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-300 shadow-2xs">
              Upload Photo
            </div>
            <Input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Label>

          {/* Take photo with camera */}
          <Label htmlFor="camera-capture" className="cursor-pointer">
            <div className="text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-300 shadow-2xs">
              Take Photo
            </div>
            <Input
              id="camera-capture"
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              capture="user"
              onChange={handleImageUpload}
            />
          </Label>
        </div>

        {profileImage ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            ✓ Photo uploaded successfully
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Photo is mandatory to register • Max 5MB
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Enter full name"
            {...register('applicant.fullName', { required: 'Full name is required' })}
            className={applicantErrors.fullName ? 'border-destructive' : ''}
          />
          {applicantErrors.fullName && (
            <p className="text-sm text-destructive">{applicantErrors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. 024 123 4567"
            {...register('applicant.phone', { required: 'Phone number is required' })}
            className={applicantErrors.phone ? 'border-destructive' : ''}
          />
          {applicantErrors.phone && (
            <p className="text-sm text-destructive">{applicantErrors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="block text-sm font-medium text-foreground">
            Residential Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Enter full address"
            {...register('applicant.address', { required: 'Address is required' })}
            className={applicantErrors.address ? 'border-destructive' : ''}
          />
          {applicantErrors.address && (
            <p className="text-sm text-destructive">{applicantErrors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school" className="block text-sm font-medium text-foreground">
            School <span className="text-destructive">*</span>
          </Label>
          <Input
            id="school"
            placeholder="School name"
            {...register('applicant.school', { required: 'School is required' })}
            className={applicantErrors.school ? 'border-destructive' : ''}
          />
          {applicantErrors.school && (
            <p className="text-sm text-destructive">{applicantErrors.school.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolType">School Type <span className="text-destructive">*</span></Label>
          <Select
            onValueChange={(value) => setValue('applicant.schoolType', value)}
            defaultValue={watch('applicant.schoolType')}
          >
            <SelectTrigger className={applicantErrors.schoolType ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select institution type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic School">Basic School</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="College">College</SelectItem>
              <SelectItem value="University">University</SelectItem>
            </SelectContent>
          </Select>
          {applicantErrors.schoolType && (
            <p className="text-sm text-destructive">{applicantErrors.schoolType.message || 'School type is required'}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade <span className="text-destructive">*</span></Label>
          <Input
            id="grade"
            placeholder="e.g., 5th Grade"
            {...register('applicant.grade', { required: 'Grade is required' })}
            className={applicantErrors.grade ? 'border-destructive' : ''}
          />
          {applicantErrors.grade && (
            <p className="text-sm text-destructive">{applicantErrors.grade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('applicant.dateOfBirth', { required: 'Date of birth is required' })}
            onChange={handleDateChange}
            className={applicantErrors.dateOfBirth ? 'border-destructive' : ''}
          />
          {applicantErrors.dateOfBirth && (
            <p className="text-sm text-destructive">{applicantErrors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" disabled placeholder="Auto-calculated" {...register('applicant.age')} className="bg-slate-100 text-slate-700 border-slate-200" />
          {dateOfBirth && calculateAge(dateOfBirth) < 10 && (
            <p className="text-sm text-destructive">Applicant must be at least 10 years old</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="church" className="block text-sm font-medium text-foreground">
            Select Church <span className="text-destructive">*</span>
          </Label>
          <Select
            value={
              isCustomChurch
                ? 'OTHER'
                : churchSuggestions.includes(watch('applicant.church'))
                ? watch('applicant.church')
                : watch('applicant.church')
                ? 'OTHER'
                : ''
            }
            onValueChange={(val) => {
              if (val === 'OTHER') {
                setIsCustomChurch(true);
                if (churchSuggestions.includes(watch('applicant.church'))) {
                  setValue('applicant.church', '', { shouldValidate: true });
                }
              } else {
                setIsCustomChurch(false);
                setValue('applicant.church', val, { shouldValidate: true });
              }
            }}
          >
            <SelectTrigger className={applicantErrors.church ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your church" />
            </SelectTrigger>
            <SelectContent>
              {churchSuggestions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              <SelectItem value="OTHER">Other Church (Outside Santasi District)</SelectItem>
            </SelectContent>
          </Select>

          {isCustomChurch && (
            <div className="mt-2 space-y-1 animate-fade-in">
              <Label htmlFor="custom-church" className="text-xs font-medium text-muted-foreground">
                Enter your Church Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="custom-church"
                placeholder="e.g. Bantama SDA Church"
                value={watch('applicant.church') || ''}
                onChange={(e) => setValue('applicant.church', e.target.value, { shouldValidate: true })}
                className={applicantErrors.church ? 'border-destructive' : ''}
              />
            </div>
          )}

          {applicantErrors.church && (
            <p className="text-sm text-destructive">{applicantErrors.church.message || 'Church selection is required'}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredClubName" className="block text-sm font-medium text-foreground">
            Preferred Pathfinder Club <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preferredClubName"
            placeholder="Club name"
            {...register('applicant.preferredClubName', { required: 'Preferred club is required' })}
            className={applicantErrors.preferredClubName ? 'border-destructive' : ''}
          />
          {applicantErrors.preferredClubName && (
            <p className="text-sm text-destructive">{applicantErrors.preferredClubName.message}</p>
          )}
        </div>
      </div>

      {/* Ghana Card Upload - shown for Senior Youth & Master Guide */}
      {isSeniorOrMasterGuide && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-6 mt-6">
          <div className="mb-2">
            <h3 className="font-heading text-lg font-semibold text-foreground">Ghana Card Identification</h3>
            <p className="text-sm text-muted-foreground">Required for {membershipCategory} registration</p>
          </div>

          {ghanaCardImage ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white">
              <img
                src={ghanaCardImage}
                alt="Ghana Card"
                className="w-full max-h-48 object-contain p-2"
              />
              <button
                type="button"
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold text-sm shadow-md hover:bg-destructive/90 transition-colors"
                onClick={removeGhanaCard}
                aria-label="Remove Ghana card"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Label htmlFor="ghana-card-upload" className="cursor-pointer flex-1">
                <div className="flex flex-col items-center gap-1 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 px-4 py-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary transition-colors text-center">
                  <span className="font-semibold text-primary">Upload Ghana Card</span>
                  <span className="text-xs text-muted-foreground">Browse files from device</span>
                </div>
                <Input
                  id="ghana-card-upload"
                  ref={ghanaCardInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleGhanaCardUpload}
                />
              </Label>

              <Label htmlFor="ghana-card-camera" className="cursor-pointer flex-1">
                <div className="flex flex-col items-center gap-1 text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 px-4 py-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary transition-colors text-center">
                  <span className="font-semibold text-primary">Take Photo</span>
                  <span className="text-xs text-muted-foreground">Capture with camera</span>
                </div>
                <Input
                  id="ghana-card-camera"
                  ref={ghanaCardCameraRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleGhanaCardUpload}
                />
              </Label>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Upload a clear scan or snapshot of your Ghana Card • Max 5MB</p>
        </div>
      )}
    </div>
  );
};

export default Step1PersonalInfo;
