import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '@/context/UserAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowRight, ShieldCheck, CreditCard, Sparkles, Phone, Hash } from 'lucide-react';
import { getRegistrations } from '@/lib/registrations';

export const UserLogin: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'ref' | 'phone'>('ref');
  const [referenceId, setReferenceId] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sampleCandidate, setSampleCandidate] = useState<{ id: string; name: string; phone: string } | null>(null);

  const { login } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there are any registrations available to suggest a sample
    const regs = getRegistrations();
    if (regs.length > 0) {
      const first = regs[0];
      setSampleCandidate({
        id: first.id,
        name: first.applicant?.fullName || 'Candidate',
        phone: first.applicant?.phone || first.guardian?.phone || '',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = referenceId.trim();
    const cleanContact = contact.trim();

    if (!cleanRef && !cleanContact) {
      toast.error('Please enter your Reference ID or Registered Phone Number');
      return;
    }

    setIsLoading(true);
    const res = await login(cleanRef, cleanContact);
    setIsLoading(false);

    if (res.success) {
      toast.success('Welcome to your Member Portal!');
      navigate('/portal');
    } else {
      toast.error(res.message || 'No matching record found. Please verify details.');
    }
  };

  const handleFillDemo = (id: string, phone: string) => {
    if (loginMode === 'ref') {
      setReferenceId(id);
    } else {
      setContact(phone);
    }
    toast.info(`Filled with registered record (${id})`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg space-y-6 relative z-10">
          {/* Card Header & Brand */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-primary p-1 mb-1">
              <img
                src="/falcons-logo.png"
                alt="Hinterland Falcons Emblem"
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Santasi AYM Member Access</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Member & Parent Portal
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Verify your official club status, print your digital membership card, track class progress, and manage uniform orders.
            </p>
          </div>

          {/* Login Form Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginMode('ref')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'ref'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span>Reference ID</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('phone')}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginMode === 'phone'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Phone / Contact</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMode === 'ref' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="referenceId" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Application Reference ID *
                    </Label>
                    <span className="text-[11px] text-slate-600 font-mono">e.g. PF-2026-XXXX</span>
                  </div>
                  <Input
                    id="referenceId"
                    placeholder="Enter your PF-ID (e.g. PF-2026-0001)"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value.toUpperCase())}
                    className="rounded-xl h-12 border-slate-300 text-sm font-mono tracking-wide focus:border-primary"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-600 leading-normal">
                    This ID was generated when you submitted your online registration form.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Registered Phone Number *
                    </Label>
                    <span className="text-[11px] text-slate-600">Applicant or Guardian</span>
                  </div>
                  <Input
                    id="contact"
                    placeholder="e.g. 0241234567"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="rounded-xl h-12 border-slate-300 text-sm focus:border-primary"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-600 leading-normal">
                    The phone number used as either the applicant's or guardian's phone number during registration.
                  </p>
                </div>
              )}

              {/* Sample / Demo helper chip if available */}
              {sampleCandidate && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 block text-[11px] uppercase">
                      Quick Demo Access
                    </span>
                    <span className="text-amber-800 text-[11px]">
                      {sampleCandidate.name} ({sampleCandidate.id})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFillDemo(sampleCandidate.id, sampleCandidate.phone)}
                    className="h-7 text-[11px] bg-white text-amber-900 border-amber-300 hover:bg-amber-100 font-semibold shrink-0 rounded-lg"
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-amber-600" />
                    Auto-Fill
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-[#183d3a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Enter Member Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Portal Capabilities Overview */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Your Portal Privileges</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Official PVC Digital ID Card
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Progressive Class Checklists
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Uniform Fabric Tracking
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> Roll-call Meeting Attendance
                </div>
              </div>
            </div>

            {/* Bottom Links */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-center text-xs">
              <div className="text-slate-600">
                Not registered yet for the 2026 season?{' '}
                <Link to="/register" className="font-bold text-primary hover:underline">
                  Submit Online Application &rarr;
                </Link>
              </div>
              <div className="text-slate-600 flex items-center justify-center gap-4 text-[11px]">
                <Link to="/church/login" className="text-slate-600 hover:text-slate-900 underline">
                  Church Leader Portal
                </Link>
                <span>•</span>
                <Link to="/admin/login" className="text-slate-600 hover:text-slate-900 underline">
                  District Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserLogin;
