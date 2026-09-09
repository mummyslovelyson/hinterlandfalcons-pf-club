import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Menu,
    X,
    ChevronDown,
    Calendar,
    Newspaper,
    Clock,
    Shirt,
    Search,
    BookOpen,
    Award,
    User,
    Church,
    ShieldCheck,
    Home,
    Info,
    Phone,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const [mobilePortalsOpen, setMobilePortalsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;
    const isActivitiesActive = location.pathname === '/events' || location.pathname === '/blog';
    const isServicesActive = location.pathname === '/uniform-request';
    const isPortalsActive =
        location.pathname.startsWith('/portal') ||
        location.pathname.startsWith('/church') ||
        location.pathname.startsWith('/admin');

    // Auto-close mobile menu when changing route
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu is open to prevent background bleed
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="container flex h-16 items-center justify-between">
                {/* Brand Logo & Title */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border-2 border-amber-500/90 shadow-sm group-hover:shadow transition-all group-hover:scale-105 shrink-0 bg-primary">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Pathfinder Club Logo"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-heading text-base md:text-lg font-bold text-foreground tracking-tight leading-tight">
                                Hinterland Falcons
                            </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium leading-tight">
                            Pathfinder Club
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
                    <Link
                        to="/"
                        className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                            isActive('/')
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                    >
                        Home
                    </Link>

                    <Link
                        to="/about"
                        className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                            isActive('/about')
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                    >
                        About
                    </Link>

                    {/* Activities Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer outline-none',
                                isActivitiesActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground'
                            )}
                        >
                            <span>Activities</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 shadow-lg rounded-xl border border-border/80">
                            <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Events & Engagements
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/events" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Events & Camps</span>
                                        <span className="text-[11px] text-muted-foreground">Club rallies, campouts, and dates</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#gatherings" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Clock className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Gathering Schedule</span>
                                        <span className="text-[11px] text-muted-foreground">Sunday drills & Sabbath AY society</span>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/blog" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Newspaper className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Blog & Articles</span>
                                        <span className="text-[11px] text-muted-foreground">Youth ministry devotionals & news</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                                <a
                                    href="/#one-voice-27"
                                    className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/30 hover:border-purple-500 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                                        <span className="text-xs font-bold text-foreground">OneVoice27 Global</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-purple-600 text-white px-1.5 py-0.5 rounded leading-none">
                                        LAUNCH
                                    </span>
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Services & Regalia Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer outline-none',
                                isServicesActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground'
                            )}
                        >
                            <span>Services</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 shadow-lg rounded-xl border border-border/80">
                            <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Member Services & Curriculum
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/uniform-request" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Shirt className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Uniform & Regalia Orders</span>
                                        <span className="text-[11px] text-muted-foreground">Field fabrics, dress uniforms, scarves</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#track-status" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Search className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Track Application</span>
                                        <span className="text-[11px] text-muted-foreground">Check status of your 2026 intake</span>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                                <a href="/#classes" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <BookOpen className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Pathfinder Curriculum</span>
                                        <span className="text-[11px] text-muted-foreground">Friend to Master Guide requirements</span>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#pledge-law" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Award className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Pathfinder Pledge & Law</span>
                                        <span className="text-[11px] text-muted-foreground">Club creed, aim, and spiritual pillars</span>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Portals Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer outline-none',
                                isPortalsActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground'
                            )}
                        >
                            <span>Portals</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-2 shadow-lg rounded-xl border border-border/80">
                            <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Secure Access Portals
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/portal" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Member & Parent Portal</span>
                                        <span className="text-[11px] text-muted-foreground">Attendance, awards, and credentials</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/church" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <Church className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Church Leader Portal</span>
                                        <span className="text-[11px] text-muted-foreground">Congregation roster & youth intake</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                                <Link to="/admin" className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-accent">
                                    <ShieldCheck className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-xs block text-foreground">Executive Admin</span>
                                        <span className="text-[11px] text-muted-foreground">Master club administration & reports</span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Contact Link */}
                    <Link
                        to="/contact"
                        className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                            isActive('/contact')
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                    >
                        Contact
                    </Link>

                    <div className="h-5 w-px bg-border mx-1" />

                    {/* Primary Apply CTA */}
                    <Button asChild size="sm" className="rounded-lg bg-primary hover:bg-primary/90 text-white font-medium px-4 shadow-sm">
                        <Link to="/register">
                            Apply for 2026
                        </Link>
                    </Button>
                </nav>

                {/* Mobile Right Controls: Quick Apply Button & Hamburger Toggle */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-3 shadow-xs"
                    >
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                            Apply
                        </Link>
                    </Button>
                    <button
                        className="rounded-lg p-2 text-foreground hover:bg-secondary active:scale-95 transition-all outline-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5 text-foreground" />
                        ) : (
                            <Menu className="h-5 w-5 text-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Backdrop & Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 top-[65px] bg-black/45 backdrop-blur-[2px] z-40 lg:hidden"
                        />

                        {/* Slide-down Drawer bounded to viewport */}
                        <motion.div
                            key="mobile-drawer"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed inset-x-0 top-[65px] z-50 max-h-[calc(100dvh-4.25rem)] flex flex-col border-b border-border bg-card/98 backdrop-blur-xl lg:hidden shadow-2xl overflow-hidden"
                        >
                            {/* Scrollable Navigation Body */}
                            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
                                {/* Top direct links pill bar */}
                                <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary/60 rounded-xl border border-border/70">
                                    <Link
                                        to="/"
                                        className={cn(
                                            'flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all',
                                            isActive('/')
                                                ? 'bg-card text-primary shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Home className="h-3.5 w-3.5" />
                                        <span>Home</span>
                                    </Link>
                                    <Link
                                        to="/about"
                                        className={cn(
                                            'flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all',
                                            isActive('/about')
                                                ? 'bg-card text-primary shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                        <span>About</span>
                                    </Link>
                                    <Link
                                        to="/contact"
                                        className={cn(
                                            'flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all',
                                            isActive('/contact')
                                                ? 'bg-card text-primary shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>Contact</span>
                                    </Link>
                                </div>

                                {/* OneVoice27 Global Launch Banner */}
                                <a
                                    href="/#one-voice-27"
                                    className="px-3 py-2.5 text-xs font-bold text-amber-300 bg-gradient-to-r from-purple-950 via-[#112c27] to-[#070b19] rounded-xl border border-purple-500/40 flex items-center justify-between shadow-xs group"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                                        </span>
                                        <span className="text-white font-semibold">OneVoice27: Mission For All</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                                        GLOBAL LAUNCH
                                    </span>
                                </a>

                                {/* Accordion 1: Activities & Events */}
                                <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-2xs">
                                    <button
                                        onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold tracking-tight text-foreground hover:bg-secondary/60 transition-colors',
                                            mobileActivitiesOpen && 'bg-secondary/40 border-b border-border/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-semibold text-xs">Activities & Events</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md font-medium">3</span>
                                            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', mobileActivitiesOpen && 'rotate-180 text-primary')} />
                                        </div>
                                    </button>

                                    {mobileActivitiesOpen && (
                                        <div className="p-2 space-y-1 bg-secondary/15">
                                            <Link
                                                to="/events"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/events')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Events & Camps</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Club rallies, campouts, and dates</span>
                                                </div>
                                            </Link>

                                            <a
                                                href="/#gatherings"
                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/70 text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Gathering Schedule</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Sunday drills & Sabbath AY society</span>
                                                </div>
                                            </a>

                                            <Link
                                                to="/blog"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/blog')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                                    <Newspaper className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Blog & Articles</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Youth ministry devotionals & news</span>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Accordion 2: Services & Regalia */}
                                <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-2xs">
                                    <button
                                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold tracking-tight text-foreground hover:bg-secondary/60 transition-colors',
                                            mobileServicesOpen && 'bg-secondary/40 border-b border-border/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Shirt className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-semibold text-xs">Services & Regalia</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md font-medium">4</span>
                                            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', mobileServicesOpen && 'rotate-180 text-primary')} />
                                        </div>
                                    </button>

                                    {mobileServicesOpen && (
                                        <div className="p-2 space-y-1 bg-secondary/15">
                                            <Link
                                                to="/uniform-request"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/uniform-request')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                                    <Shirt className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Uniform & Regalia Orders</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Field fabrics, dress uniforms, scarves</span>
                                                </div>
                                            </Link>

                                            <a
                                                href="/#track-status"
                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/70 text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                    <Search className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Track Application</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Check status of your 2026 intake</span>
                                                </div>
                                            </a>

                                            <a
                                                href="/#classes"
                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/70 text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Pathfinder Curriculum</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Friend to Master Guide requirements</span>
                                                </div>
                                            </a>

                                            <a
                                                href="/#pledge-law"
                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-secondary/70 text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                                    <Award className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Pathfinder Pledge & Law</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Club creed, aim, and spiritual pillars</span>
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Accordion 3: Access Portals */}
                                <div className="rounded-xl border border-border/80 overflow-hidden bg-card shadow-2xs">
                                    <button
                                        onClick={() => setMobilePortalsOpen(!mobilePortalsOpen)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold tracking-tight text-foreground hover:bg-secondary/60 transition-colors',
                                            mobilePortalsOpen && 'bg-secondary/40 border-b border-border/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                <Church className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-semibold text-xs">Access Portals</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md font-medium">3</span>
                                            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', mobilePortalsOpen && 'rotate-180 text-primary')} />
                                        </div>
                                    </button>

                                    {mobilePortalsOpen && (
                                        <div className="p-2 space-y-1 bg-secondary/15">
                                            <Link
                                                to="/portal"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/portal')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                    <User className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Member & Parent Portal</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Attendance, awards, and credentials</span>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/church"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/church')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                                    <Church className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Church Leader Portal</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Congregation roster & youth intake</span>
                                                </div>
                                            </Link>

                                            <Link
                                                to="/admin"
                                                className={cn(
                                                    'flex items-start gap-2.5 p-2 rounded-lg transition-colors',
                                                    isActive('/admin')
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'hover:bg-secondary/70 text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <div className="h-7 w-7 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-xs block leading-tight">Executive Admin</span>
                                                    <span className="text-[11px] text-muted-foreground leading-tight">Master club administration & reports</span>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Bottom Action Zone */}
                            <div className="border-t border-border/80 bg-card/95 p-3.5 backdrop-blur-md shrink-0 shadow-lg space-y-2">
                                <Button
                                    asChild
                                    size="default"
                                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                                >
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                                        <span>Apply for Membership (2026)</span>
                                        <ArrowRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                </Button>

                                <div className="grid grid-cols-2 gap-2 pt-0.5">
                                    <Link
                                        to="/portal"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary text-[11px] font-semibold text-foreground transition-colors text-center"
                                    >
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        <span>Member Portal</span>
                                    </Link>
                                    <a
                                        href="/#track-status"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-border/70 bg-secondary/40 hover:bg-secondary text-[11px] font-semibold text-foreground transition-colors text-center"
                                    >
                                        <Search className="h-3.5 w-3.5 text-primary" />
                                        <span>Track Status</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
