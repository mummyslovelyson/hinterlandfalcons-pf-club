import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold text-foreground">Santasi SDA Pathfinder Club</span>
            <span className="text-xs text-muted-foreground">Registration Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
          >
            Home
          </Link>
          <Link
            to="/register"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/register') ? 'text-primary' : 'text-muted-foreground'
              }`}
          >
            Register
          </Link>
          <Button asChild variant="hero" size="sm">
            <Link to="/register">Apply Now</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            <Link
              to="/"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Button asChild variant="hero" size="sm" className="w-full">
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                Apply Now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
