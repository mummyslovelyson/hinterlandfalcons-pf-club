import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import SignaturePad from './SignaturePad';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

const Step4Consent = () => {
  const { watch, setValue } = useFormContext();

  useEffect(() => {
    setValue('consent.signatureDate', new Date().toISOString().split('T')[0]);
  }, [setValue]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">Waiver & Consent</h2>
        <p className="text-muted-foreground mt-2">Please review and accept the terms below</p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Acknowledgement & Waiver
        </h3>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-card">
            <Checkbox
              id="acknowledgesResponsibility"
              checked={watch('consent.acknowledgesResponsibility')}
              onCheckedChange={(checked) => setValue('consent.acknowledgesResponsibility', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="acknowledgesResponsibility" className="cursor-pointer font-medium">
                Acknowledgement of Responsibility <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I acknowledge and accept full responsibility for my child's participation in Pathfinder Club activities.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-card">
            <Checkbox
              id="waivesClaims"
              checked={watch('consent.waivesClaims')}
              onCheckedChange={(checked) => setValue('consent.waivesClaims', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="waivesClaims" className="cursor-pointer font-medium">
                Waiver of Claims <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I waive any and all claims against the Pathfinder Club for any injuries or damages during activities.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-card">
            <Checkbox
              id="agreesToCooperate"
              checked={watch('consent.agreesToCooperate')}
              onCheckedChange={(checked) => setValue('consent.agreesToCooperate', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="agreesToCooperate" className="cursor-pointer font-medium">
                Agreement to Cooperate <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm my willingness to cooperate with Pathfinder Club leadership and follow club guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Digital Signature
        </h3>
        <p className="text-sm text-muted-foreground">
          By signing below, you confirm that all information provided is accurate.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Signature <span className="text-destructive">*</span></Label>
            <SignaturePad
              value={watch('consent.signature') || ''}
              onChange={(sig) => setValue('consent.signature', sig)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typedName">Or Type Full Legal Name</Label>
              <Input
                id="typedName"
                placeholder="Type your full legal name"
                value={watch('consent.signature') || ''}
                onChange={(e) => setValue('consent.signature', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatureDate" className="block text-sm font-medium text-foreground">
                Date
              </Label>
              <Input
                id="signatureDate"
                type="date"
                value={watch('consent.signatureDate') || new Date().toISOString().split('T')[0]}
                readOnly
                className="bg-slate-100 text-slate-700 border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Consent;
