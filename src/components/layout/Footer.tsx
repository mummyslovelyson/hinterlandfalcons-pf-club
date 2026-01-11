import { Compass, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Compass className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-foreground">Pathfinder Club</span>
                <span className="text-xs text-muted-foreground">Registration Portal</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering youth through adventure, service, and spiritual growth since 1950.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-muted-foreground hover:text-primary">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-muted-foreground">
                Email: info@pathfinderclub.org
              </li>
              <li className="text-sm text-muted-foreground">
                Phone: (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pathfinder Club. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-destructive" /> for Pathfinders everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
