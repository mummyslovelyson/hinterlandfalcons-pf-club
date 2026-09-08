import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-200">
      {/* Top Banner Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-amber-500 to-emerald-600" />

      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Organization & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden border-2 border-amber-500 shadow-md flex-shrink-0 bg-primary">
                <img
                  src="/falcons-logo.png"
                  alt="Hinterland Falcons Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-white tracking-tight">
                  Hinterland Falcons Pathfinder Club
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  Santasi Adventist Youth Ministries • Formed & Launched October 2023
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              A vibrant youth ministry of the Santasi Seventh-day Adventist Church. Training young people in spiritual devotion, practical honors, civic service, and outdoor survival.
            </p>

            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 max-w-md">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Club Motto
              </div>
              <p className="text-xs text-slate-200 font-medium italic">
                "We Are Smart and Vigilant in Service"
              </p>
            </div>
          </div>

          {/* Column 2: Club Navigation & Portals */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Explore & Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-amber-400 transition-colors">
                  About Hinterland Falcons
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Events & Gatherings
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Contact & Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-amber-400 transition-colors">
                  2026 Application Form
                </Link>
              </li>
              <li>
                <a href="/#track-status" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Track Application Status
                </a>
              </li>
              <li>
                <Link to="/uniform-request" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Uniform & Scarf Orders
                </Link>
              </li>
              <li>
                <a href="/#one-voice-27" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>OneVoice27 Global Launch</span>
                </a>
              </li>
              <li>
                <Link to="/church/login" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Church Leader Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Meeting & Schedule */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Club Gatherings
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <strong className="text-slate-200 block">Sunday Parade & Drills</strong>
                <span>8:30 AM – 11:30 AM (Field Uniform)</span>
              </li>
              <li>
                <strong className="text-slate-200 block">Sabbath AY Society</strong>
                <span>4:00 PM – 6:00 PM (Dress Uniform)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Location & Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Church Location
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span>Santasi SDA Church, Opp. Kumasi High School Road, Santasi, Kumasi, Ghana</span>
              </li>
              <li>
                <span className="text-xs">santasi.pathfinders@gmail.com</span>
              </li>
              <li>
                <span>+233 (0)24 555 7890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Santasi SDA Pathfinder Club. Seventh-day Adventist Church Youth Ministries.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Designed for ministry & youth service
            </span>
            <span>•</span>
            <a
              href="https://www.gcyouthministries.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              GC Youth Ministries &rarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
