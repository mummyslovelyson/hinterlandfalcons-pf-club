import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const ChurchLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useChurchAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please enter both username and password');
            return;
        }

        setIsLoading(true);
        const success = await login(username, password);
        if (success) {
            toast.success('Login successful!');
            navigate('/church');
        } else {
            toast.error('Invalid credentials. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Church Sanctuary Image with Fixed Cover */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/church-portal-bg.jpg')" }}
            />

            {/* Perfect Linear-Gradient Overlay in Club Colors (Deep Pine Green & Slate) */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-[#163f3c]/88 to-slate-950/94 backdrop-blur-[2px]"
            />

            <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl mb-3 bg-primary p-0.5">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Logo"
                            className="h-full w-full object-cover rounded-full"
                        />
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Hinterland Falcons
                    </h1>
                    <p className="text-sm text-amber-300/90 font-semibold uppercase tracking-wider mt-1">
                        Santasi AYM • Church Leader Portal
                    </p>
                </div>

                <div className="bg-card/95 backdrop-blur-md rounded-2xl border border-border/60 shadow-2xl p-6 sm:p-8">
                    <div className="mb-5 text-center">
                        <h2 className="font-heading text-lg font-bold text-foreground">Leader Sign In</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Access roster management and unit verifications
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Church Username / ID</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="e.g. santasi_director"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Security Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your security password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10 rounded-xl h-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl bg-muted/50 p-3 border border-border/60 text-xs flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <span className="font-semibold text-foreground">Santasi SDA Demo:</span>
                                <span className="text-muted-foreground ml-1.5 font-mono text-[11px]">santasi_clerk</span>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs px-2.5 shrink-0"
                                onClick={() => {
                                    setUsername('santasi_clerk');
                                    setPassword('Password@2026');
                                    toast.info('Santasi demo credentials filled');
                                }}
                            >
                                Auto-Fill
                            </Button>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md">
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Sign In to Portal →'
                            )}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/70 text-xs text-muted-foreground">
                        <Link to="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium">
                            ← Main Website
                        </Link>
                        <Link to="/admin/login" className="hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                            District Admin →
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-300/80">
                  "We Are Smart and Vigilant in Service" • Santasi SDA
                </p>
            </div>
        </div>
    );
};

export default ChurchLogin;
