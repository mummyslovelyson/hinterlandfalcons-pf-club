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
    BookOpen,
    Award,
    User,
    Church,
    ArrowRight,
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
        location.pathname.startsWith('/church');

    // Auto-close mobile menu when changing route
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu is open to prevent underlying scroll bleed
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
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white dark:bg-zinc-950">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="container flex h-16 items-center justify-between">
                {/* Brand Logo & Title */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full overflow-hidden border-2 border-amber-500 shadow-sm transition-transform group-hover:scale-105 shrink-0 bg-primary">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Pathfinder Club Logo"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-heading text-base md:text-lg font-bold text-foreground tracking-tight leading-tight">
                            Hinterland Falcons
                        </span>
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
                        <DropdownMenuContent align="start" className="w-60 p-1.5 shadow-lg rounded-xl border border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Activities & Events
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/events" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                                    <span>Events & Camps</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#gatherings" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Clock className="h-4 w-4 text-primary shrink-0" />
                                    <span>Gathering Schedule</span>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/blog" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Newspaper className="h-4 w-4 text-primary shrink-0" />
                                    <span>Blog & Articles</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem asChild>
                                <a
                                    href="/#one-voice-27"
                                    className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-secondary text-xs font-semibold cursor-pointer text-primary"
                                >
                                    <span>OneVoice27 Global</span>
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Initiative</span>
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Services Dropdown */}
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
                        <DropdownMenuContent align="start" className="w-60 p-1.5 shadow-lg rounded-xl border border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Club Services
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/uniform-request" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Shirt className="h-4 w-4 text-primary shrink-0" />
                                    <span>Uniform & Regalia Orders</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#classes" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                                    <span>Pathfinder Curriculum</span>
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href="/#pledge-law" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Award className="h-4 w-4 text-primary shrink-0" />
                                    <span>Pathfinder Pledge & Law</span>
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
                        <DropdownMenuContent align="start" className="w-60 p-1.5 shadow-lg rounded-xl border border-border">
                            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                                Secure Access
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to="/portal" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <User className="h-4 w-4 text-primary shrink-0" />
                                    <span>Member & Parent Portal</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/church" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-accent text-xs font-medium">
                                    <Church className="h-4 w-4 text-primary shrink-0" />
                                    <span>Church Leader Portal</span>
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

                {/* Mobile Menu Toggle Button */}
                <button
                    className="lg:hidden p-2 rounded-lg text-foreground hover:bg-secondary active:scale-95 transition-all outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {mobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Menu className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Mobile Dropdown Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        key="mobile-dropdown"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full border-t border-border bg-white dark:bg-zinc-950 shadow-xl lg:hidden max-h-[calc(100dvh-4.25rem)] flex flex-col overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                            {/* Primary Navigation Links */}
                            <Link
                                to="/"
                                className={cn(
                                    'flex items-center py-2.5 text-base font-medium rounded-md transition-colors',
                                    isActive('/')
                                        ? 'text-primary font-semibold'
                                        : 'text-foreground hover:text-primary'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <Link
                                to="/about"
                                className={cn(
                                    'flex items-center py-2.5 text-base font-medium rounded-md transition-colors',
                                    isActive('/about')
                                        ? 'text-primary font-semibold'
                                        : 'text-foreground hover:text-primary'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>

                            <div className="h-px bg-border/60 my-1" />

                            {/* Activities Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                                    className="w-full flex items-center justify-between py-2.5 text-base font-medium text-foreground hover:text-primary transition-colors text-left"
                                >
                                    <span>Activities & Events</span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                            mobileActivitiesOpen && 'rotate-180 text-primary'
                                        )}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {mobileActivitiesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            className="overflow-hidden pl-3 border-l border-border/80 space-y-1 my-1"
                                        >
                                            <Link
                                                to="/events"
                                                className={cn(
                                                    'block py-2 text-sm transition-colors',
                                                    isActive('/events')
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Events & Camps Calendar
                                            </Link>
                                            <a
                                                href="/#gatherings"
                                                className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Gathering Schedule & Locations
                                            </a>
                                            <Link
                                                to="/blog"
                                                className={cn(
                                                    'block py-2 text-sm transition-colors',
                                                    isActive('/blog')
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Blog & Articles
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Services Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                    className="w-full flex items-center justify-between py-2.5 text-base font-medium text-foreground hover:text-primary transition-colors text-left"
                                >
                                    <span>Club Services</span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                            mobileServicesOpen && 'rotate-180 text-primary'
                                        )}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {mobileServicesOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            className="overflow-hidden pl-3 border-l border-border/80 space-y-1 my-1"
                                        >
                                            <Link
                                                to="/uniform-request"
                                                className={cn(
                                                    'block py-2 text-sm transition-colors',
                                                    isActive('/uniform-request')
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Uniform & Regalia Orders
                                            </Link>
                                            <a
                                                href="/#classes"
                                                className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Pathfinder Curriculum Requirements
                                            </a>
                                            <a
                                                href="/#pledge-law"
                                                className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Pathfinder Pledge & Law
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Portals Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobilePortalsOpen(!mobilePortalsOpen)}
                                    className="w-full flex items-center justify-between py-2.5 text-base font-medium text-foreground hover:text-primary transition-colors text-left"
                                >
                                    <span>Secure Portals</span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                            mobilePortalsOpen && 'rotate-180 text-primary'
                                        )}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {mobilePortalsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                            className="overflow-hidden pl-3 border-l border-border/80 space-y-1 my-1"
                                        >
                                            <Link
                                                to="/portal"
                                                className={cn(
                                                    'block py-2 text-sm transition-colors',
                                                    isActive('/portal')
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Member & Parent Portal
                                            </Link>
                                            <Link
                                                to="/church"
                                                className={cn(
                                                    'block py-2 text-sm transition-colors',
                                                    isActive('/church')
                                                        ? 'text-primary font-semibold'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Church Leader Portal
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-px bg-border/60 my-1" />

                            {/* Contact Link */}
                            <Link
                                to="/contact"
                                className={cn(
                                    'flex items-center py-2.5 text-base font-medium rounded-md transition-colors',
                                    isActive('/contact')
                                        ? 'text-primary font-semibold'
                                        : 'text-foreground hover:text-primary'
                                )}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>

                            {/* OneVoice27 Direct Clean Link */}
                            <a
                                href="/#one-voice-27"
                                className="flex items-center justify-between py-2 text-xs font-semibold text-primary hover:underline pt-1"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>OneVoice27 Global Initiative</span>
                                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                    Explore
                                </span>
                            </a>
                        </div>

                        {/* Pinned Bottom Actions */}
                        <div className="p-4 border-t border-border bg-secondary/30 space-y-2 shrink-0">
                            <Button
                                asChild
                                size="default"
                                className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2"
                            >
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <span>Apply for 2026 Intake</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>

                            <Link
                                to="/portal"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-center py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                Existing member? Access Portal &rarr;
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
