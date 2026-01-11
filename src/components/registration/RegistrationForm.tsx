import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProgressIndicator from './ProgressIndicator';
import Step1PersonalInfo from './Step1PersonalInfo';
import Step2Membership from './Step2Membership';
import Step3Guardian from './Step3Guardian';
import Step4Consent from './Step4Consent';
import { saveRegistration, generateId, calculateAge } from '@/lib/storage';
import { Registration } from '@/types/registration';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';

const steps = [
  { number: 1, title: 'Personal Info', description: 'Applicant details' },
  { number: 2, title: 'Membership', description: 'Experience & commitment' },
  { number: 3, title: 'Guardian', description: 'Parent/Guardian info' },
  { number: 4, title: 'Consent', description: 'Waiver & signature' },
];

const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      applicant: {
        fullName: '',
        phone: '',
        address: '',
        school: '',
        grade: '',
        dateOfBirth: '',
        age: 0,
        church: '',
        preferredClubName: '',
        profileImage: '',
        schoolType: '',
      },
      membership: {
        confirmJoining: false,
        agreesToParticipate: false,
        wasPreviousPathfinder: false,
        previousClubName: '',
        completedClasses: [],
        honorsEarned: '',
        hasFullDressUniform: false,
        hasFullFieldUniform: false,
      },
      guardian: {
        fullName: '',
        relationship: '',
        phone: '',
        occupation: '',
        isMasterGuide: false,
        priorInvolvement: '',
        areasOfAssistance: [],
      },
      consent: {
        acknowledgesResponsibility: false,
        waivesClaims: false,
        agreesToCooperate: false,
        signature: '',
        signatureDate: new Date().toISOString().split('T')[0],
      },
    },
    mode: 'onChange',
  });

  const validateStep = async (step: number): Promise<boolean> => {
    const values = methods.getValues();

    switch (step) {
      case 1: {
        const { applicant } = values;
        if (!applicant.fullName || !applicant.phone || !applicant.address ||
          !applicant.school || !applicant.grade || !applicant.dateOfBirth ||
          !applicant.church || !applicant.preferredClubName || !applicant.schoolType) {
          toast.error('Please fill in all required fields');
          return false;
        }
        const age = calculateAge(applicant.dateOfBirth);
        if (age < 10) {
          toast.error('Applicant must be at least 10 years old');
          return false;
        }
        return true;
      }

      case 2: {
        const { membership } = values;
        if (!membership.confirmJoining || !membership.agreesToParticipate) {
          toast.error('Please confirm your commitment to join the Pathfinder Club');
          return false;
        }
        return true;
      }

      case 3: {
        const { guardian } = values;
        if (!guardian.fullName || !guardian.relationship || !guardian.phone) {
          toast.error('Please fill in all required guardian information');
          return false;
        }
        return true;
      }

      case 4: {
        const { consent } = values;
        if (!consent.acknowledgesResponsibility || !consent.waivesClaims || !consent.agreesToCooperate) {
          toast.error('Please accept all consent agreements');
          return false;
        }
        if (!consent.signature) {
          toast.error('Please provide your signature');
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const values = methods.getValues();
      const registration: Registration = {
        id: generateId(),
        applicant: {
          ...values.applicant,
          age: calculateAge(values.applicant.dateOfBirth),
        },
        membership: values.membership,
        guardian: values.guardian,
        consent: {
          ...values.consent,
          signatureDate: new Date().toISOString(),
        },
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      saveRegistration(registration);

      toast.success('Application submitted successfully!', {
        description: 'You will be contacted regarding your application status.',
      });

      navigate('/registration-success');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-4xl mx-auto">
        <ProgressIndicator steps={steps} currentStep={currentStep} />

        <div className="rounded-xl border border-border bg-card shadow-card p-6 md:p-8">
          <div key={currentStep} className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both">
            {currentStep === 1 && <Step1PersonalInfo />}
            {currentStep === 2 && <Step2Membership />}
            {currentStep === 3 && <Step3Guardian />}
            {currentStep === 4 && <Step4Consent />}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="hero"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default RegistrationForm;
