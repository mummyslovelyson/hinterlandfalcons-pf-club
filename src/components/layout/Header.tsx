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
} from 'lucide-react';
import { useState } from 'react';
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

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="container flex h-16 items-center justify-between">
                {/* Brand Logo & Title */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border-2 border-amber-500/90 shadow-sm group-hover:shadow transition-all group-hover:scale-105 shrink-0 bg-primary">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Pathfinder Club Logo"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-heading text-base md:text-lg font-bold text-foreground tracking-tight">
                                Hinterland Falcons
                            </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
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
                                    className="flex items-center justify-between p-2 rounded-lg bg-linear-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/30 hover:border-purple-500 cursor-pointer"
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

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden rounded-lg p-2 text-foreground hover:bg-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        key="mobile-drawer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="border-t border-border bg-card/98 backdrop-blur-lg lg:hidden shadow-lg overflow-hidden"
                    >
                        <nav className="container flex flex-col gap-2 py-4 text-sm">
                            {/* Top direct links */}
                            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/60">
                                <Link
                                    to="/"
                                    className={cn(
                                        'py-2 px-3 text-center text-xs font-semibold rounded-lg',
                                        isActive('/') ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-foreground'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/about"
                                    className={cn(
                                        'py-2 px-3 text-center text-xs font-semibold rounded-lg',
                                        isActive('/about') ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-foreground'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    to="/contact"
                                    className={cn(
                                        'py-2 px-3 text-center text-xs font-semibold rounded-lg',
                                        isActive('/contact') ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-foreground'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact
                                </Link>
                            </div>

                            {/* OneVoice27 Announcement Banner */}
                            <a
                                href="/#one-voice-27"
                                className="px-3 py-2.5 text-xs font-bold text-amber-300 bg-linear-to-r from-purple-950 via-[#112c27] to-[#070b19] rounded-xl border border-purple-500/50 flex items-center justify-between"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                                    <span>OneVoice27: Mission For All</span>
                                </div>
                                <span className="text-[9px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded">
                                    LAUNCH
                                </span>
                            </a>

                            {/* Activities Collapsible */}
                            <div className="rounded-xl border border-border/60 overflow-hidden bg-secondary/30">
                                <button
                                    onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary/60"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Activities & Events
                                    </span>
                                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', mobileActivitiesOpen ? 'rotate-180' : '')} />
                                </button>
                                {mobileActivitiesOpen && (
                                    <div className="px-3 pb-2.5 pt-1 space-y-1.5 border-t border-border/40 text-xs">
                                        <Link
                                            to="/events"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Events & Camps Calendar
                                        </Link>
                                        <a
                                            href="/#gatherings"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Where & When We Gather
                                        </a>
                                        <Link
                                            to="/blog"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Blog & Ministry Articles
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Services Collapsible */}
                            <div className="rounded-xl border border-border/60 overflow-hidden bg-secondary/30">
                                <button
                                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary/60"
                                >
                                    <span className="flex items-center gap-2">
                                        <Shirt className="h-4 w-4 text-emerald-600" />
                                        Services & Regalia
                                    </span>
                                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', mobileServicesOpen ? 'rotate-180' : '')} />
                                </button>
                                {mobileServicesOpen && (
                                    <div className="px-3 pb-2.5 pt-1 space-y-1.5 border-t border-border/40 text-xs">
                                        <Link
                                            to="/uniform-request"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Uniform Orders & Regalia
                                        </Link>
                                        <a
                                            href="/#track-status"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Track Application Status
                                        </a>
                                        <a
                                            href="/#classes"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Curriculum Classes (Friend to Master Guide)
                                        </a>
                                        <a
                                            href="/#pledge-law"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Pathfinder Pledge & 8 Laws
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Portals Collapsible */}
                            <div className="rounded-xl border border-border/60 overflow-hidden bg-secondary/30">
                                <button
                                    onClick={() => setMobilePortalsOpen(!mobilePortalsOpen)}
                                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary/60"
                                >
                                    <span className="flex items-center gap-2">
                                        <Church className="h-4 w-4 text-amber-600" />
                                        Access Portals
                                    </span>
                                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', mobilePortalsOpen ? 'rotate-180' : '')} />
                                </button>
                                {mobilePortalsOpen && (
                                    <div className="px-3 pb-2.5 pt-1 space-y-1.5 border-t border-border/40 text-xs">
                                        <Link
                                            to="/portal"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Member & Parent Portal
                                        </Link>
                                        <Link
                                            to="/church"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Church Leader Portal
                                        </Link>
                                        <Link
                                            to="/admin"
                                            className="block py-1.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Executive Admin Portal
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Bottom CTA */}
                            <div className="pt-2 border-t border-border mt-1">
                                <Button asChild size="default" className="w-full rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-xs">
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        Apply for Membership (2026)
                                    </Link>
                                </Button>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
