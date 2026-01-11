import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Compass, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            // Hardcoded credentials for demonstration
            if (email === 'admin@santasi.com' && password === 'pathfinder') {
                login('dummy_jwt_token');
                toast.success('Welcome back!');
                navigate('/admin');
            } else {
                toast.error('Invalid credentials. Please try again.');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg">
                        <Compass className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Santasi SDA Pathfinder</h1>
                    <p className="text-muted-foreground mt-2">Sign in to access the admin portal</p>
                </div>

                <Card className="border-border shadow-card">
                    <CardHeader>
                        <CardTitle>Admin Login</CardTitle>
                        <CardDescription>Enter your credentials to continue</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@santasi.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                    <p>Demo Credentials:</p>
                    <p>Email: admin@santasi.com</p>
                    <p>Password: pathfinder</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
