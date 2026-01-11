import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateAge } from '@/lib/storage';
import { User, Phone, MapPin, School, Church, Users, Upload, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Step1PersonalInfo = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const dateOfBirth = watch('applicant.dateOfBirth');
  const applicantErrors = (errors.applicant || {}) as Record<string, { message?: string }>;

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('applicant.profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('applicant.profileImage', '');
  };

  const profileImage = watch('applicant.profileImage');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Personal Information</h2>
        <p className="text-muted-foreground mt-2">Please provide the applicant's details below</p>
      </div>

      {/* Profile Image Upload */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-muted">
            <AvatarImage src={profileImage} className="object-cover" />
            <AvatarFallback className="text-4xl bg-muted/50">
              <User className="w-12 h-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          {profileImage && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-md">
              <Upload className="h-4 w-4" />
              Upload Photo
            </div>
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Label>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Recommended: Square format, max 2MB</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
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
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...register('applicant.phone', { required: 'Phone number is required' })}
            className={applicantErrors.phone ? 'border-destructive' : ''}
          />
          {applicantErrors.phone && (
            <p className="text-sm text-destructive">{applicantErrors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
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
          <Label htmlFor="school" className="flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
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
          <Input id="age" type="number" disabled placeholder="Auto-calculated" {...register('applicant.age')} className="bg-muted" />
          {dateOfBirth && calculateAge(dateOfBirth) < 10 && (
            <p className="text-sm text-destructive">Applicant must be at least 10 years old</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="church" className="flex items-center gap-2">
            <Church className="h-4 w-4 text-primary" />
            Church <span className="text-destructive">*</span>
          </Label>
          <Input
            id="church"
            placeholder="Church name"
            {...register('applicant.church', { required: 'Church is required' })}
            className={applicantErrors.church ? 'border-destructive' : ''}
          />
          {applicantErrors.church && (
            <p className="text-sm text-destructive">{applicantErrors.church.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredClubName" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
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
    </div>
  );
};

export default Step1PersonalInfo;
