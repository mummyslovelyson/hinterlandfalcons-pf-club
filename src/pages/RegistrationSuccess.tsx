import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const RegistrationSuccess = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const stateData = location.state as {
    registrationId?: string;
    fullName?: string;
    membershipCategory?: string;
  } | null;

  const registrationId = stateData?.registrationId || 'PF-PENDING';
  const fullName = stateData?.fullName || 'Candidate';
  const category = stateData?.membershipCategory || 'Pathfinder';

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-10 text-center">
            {/* Falcons Logo */}
            <div className="flex justify-center mb-5">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-accent shadow-md bg-primary">
                <img
                  src="/falcons-logo.png"
                  alt="Hinterland Falcons Logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome, {fullName}!
            </h1>

            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Your application for the <strong>{category}</strong> unit has been recorded and submitted to the Santasi SDA Pathfinder Club executive committee.
            </p>

            {/* Reference Number Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-center">
              <span className="text-xs font-semibold text-slate-600 block mb-1">
                Your Application Reference Number
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-wider my-2">
                {registrationId}
              </div>
              <div className="mt-3 flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs text-xs font-semibold"
                >
                  {copied ? 'Copied to Clipboard' : 'Copy Reference ID'}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Keep this code handy. You can use it on the homepage to track your application status and uniform preparation.
              </p>
            </div>

            {/* What happens next */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 mb-8 text-left">
              <h3 className="font-heading font-bold text-foreground text-base mb-4">
                What to Expect Next
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0 text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-foreground block">Executive Committee Review</strong>
                    <span>Our club leadership will review health details, school records, and guardian consents within 3–5 business days.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0 text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-foreground block">Sunday Orientation & Drill Session</strong>
                    <span>Attend our regular Sunday assembly at <strong>8:30 AM</strong> at the Santasi SDA Church grounds for introduction and unit assignment.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold flex-shrink-0 text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-foreground block">Uniform & Regalia Fitting</strong>
                    <span>Order your club field t-shirt and Class Dress uniform so you are prepared for official inspection and camporees.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-medium">
                <Link to="/portal">
                  Open Member Dashboard
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-xl border-border">
                <Link to="/uniform-request">
                  Order Uniform & Scarf
                </Link>
              </Button>

              <Button asChild variant="ghost" className="rounded-xl">
                <Link to="/">
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Authentic Support channels */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
              <div>
                <span>Email: santasi.pathfinders@gmail.com</span>
              </div>
              <div>
                <span>Phone: +233 (0)24 555 7890</span>
              </div>
              <div>
                <span>Sundays 8:30 AM • Santasi SDA</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationSuccess;
