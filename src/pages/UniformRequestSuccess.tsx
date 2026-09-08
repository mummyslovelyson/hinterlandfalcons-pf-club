import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const UniformRequestSuccess = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
                <div className="container max-w-2xl">
                    <div className="rounded-2xl border border-border bg-card shadow-card p-8 md:p-12 text-center">
                        {/* Falcons Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-primary">
                                <img
                                    src="/falcons-logo.png"
                                    alt="Hinterland Falcons Logo"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Uniform Request Submitted!
                        </h1>

                        <p className="text-muted-foreground mb-8">
                            Your uniform request has been submitted successfully. Our team will process your order and contact you when it's ready.
                        </p>

                        <div className="rounded-xl bg-muted/50 border border-border p-6 mb-8">
                            <h3 className="font-heading font-semibold text-foreground mb-4">What happens next?</h3>
                            <ul className="space-y-3 text-left text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5 text-xs font-bold">
                                        1
                                    </div>
                                    <span>Our uniform coordinator will review your request and check availability within 2-3 business days.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5 text-xs font-bold">
                                        2
                                    </div>
                                    <span>You will be contacted via phone to confirm your sizes and arrange payment details.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5 text-xs font-bold">
                                        3
                                    </div>
                                    <span>Once ready, you'll receive a notification to pick up your uniform at the next club meeting.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground mb-8">
                            <div>
                                <span>Phone: +233 (0)24 555 7890 (Uniform Desk)</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div>
                                <span>Pick up: Sundays 8:30 AM @ Santasi SDA Grounds</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild size="lg">
                                <Link to="/">
                                    Return Home
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/uniform-request">
                                    Submit Another Request
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UniformRequestSuccess;
