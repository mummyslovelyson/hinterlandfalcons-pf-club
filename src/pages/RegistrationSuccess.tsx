import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, Home, Mail, Phone } from 'lucide-react';

const RegistrationSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <div className="container max-w-2xl">
          <div className="rounded-xl border border-border bg-card shadow-card p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Application Submitted!
            </h1>
            
            <p className="text-muted-foreground mb-8">
              Thank you for submitting your Pathfinder Club application. Your application 
              has been received and is now pending review by our club administrators.
            </p>
            
            <div className="rounded-lg bg-secondary/50 p-6 mb-8">
              <h3 className="font-heading font-semibold text-foreground mb-4">What happens next?</h3>
              <ul className="space-y-3 text-left text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span>Our club leaders will review your application within 3-5 business days.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span>You will be contacted via phone or email regarding your application status.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span>Once approved, you'll receive information about your first meeting and uniform requirements.</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@pathfinderclub.org</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
            </div>
            
            <Button asChild size="lg">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegistrationSuccess;
