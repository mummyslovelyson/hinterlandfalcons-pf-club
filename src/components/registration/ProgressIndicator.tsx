import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const ProgressIndicator = ({ steps, currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="mb-8">
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                  currentStep > step.number
                    ? 'border-2 border-primary bg-primary text-white font-bold shadow-xs'
                    : currentStep === step.number
                    ? 'border-2 border-primary bg-white text-primary font-bold ring-4 ring-primary/10'
                    : 'border-2 border-slate-200 bg-white text-slate-400 font-medium'
                )}
              >
                {currentStep > step.number ? (
                  <span className="text-base font-bold">✓</span>
                ) : (
                  <span className="font-heading font-bold">{step.number}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-1 w-24 rounded-full transition-all duration-300',
                  currentStep > step.number ? 'bg-primary' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
