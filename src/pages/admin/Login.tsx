import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email.trim(), password);
            toast.success('Welcome back!');
            navigate('/admin');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Group Image with Fixed Cover */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/falcons-group.jpg')" }}
            />

            {/* Perfect Linear-Gradient Overlay in Club Colors (Deep Pine Green & Slate) */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-[#163f3c]/88 to-slate-950/94 backdrop-blur-[2px]"
            />

            <div className="relative z-10 w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full overflow-hidden border border-white/20 mb-3 bg-primary p-0.5">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Logo"
                            className="h-full w-full object-cover rounded-full"
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                        Hinterland Falcons
                    </h1>
                    <p className="text-emerald-200 text-xs sm:text-sm font-medium uppercase tracking-wider mt-1">
                        District Administrator Portal
                    </p>
                </div>

                <Card className="border border-slate-200 bg-white rounded-2xl">
                    <CardHeader className="space-y-1 text-center pb-4">
                        <CardTitle className="text-xl font-bold">Admin Sign In</CardTitle>
                        <CardDescription>
                            Enter your authorized credentials to access club records
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Administrator Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@pathfinder.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Security Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rounded-xl h-11"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Access Admin Dashboard'
                                )}
                            </Button>

                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-1">
                                <Link
                                    to="/"
                                    className="hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
                                >
                                    ← Return to Home
                                </Link>
                                <Link
                                    to="/church/login"
                                    className="hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium text-primary"
                                >
                                    Church Leader Login →
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-slate-300/80">
                  "We Are Smart and Vigilant in Service" • Santasi AYM
                </p>
            </div>
        </div>
    );
};

export default Login;
