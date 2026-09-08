import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shirt,
  Church,
  ExternalLink,
  Calendar,
  CheckSquare,
  Award,
  Coins,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Applications', path: '/admin/applications' },
  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: CheckSquare, label: 'Attendance', path: '/admin/attendance' },
  { icon: Calendar, label: 'Club Events', path: '/admin/events' },
  { icon: Award, label: 'Curriculum & Honors', path: '/admin/curriculum' },
  { icon: Coins, label: 'Dues & Finances', path: '/admin/finances' },
  { icon: Church, label: 'Churches', path: '/admin/churches' },
  { icon: Shirt, label: 'Uniform Requests', path: '/admin/uniform-requests' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' },
  { icon: Church, label: 'Church Portal', path: '/church/login', external: true },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
  hideCollapse?: boolean;
}

const AdminSidebar = ({ className, onNavigate, hideCollapse }: AdminSidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed = collapsed && !hideCollapse;

  return (
    <aside className={cn(
      "bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo / Crest */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-white/10 p-0.5">
            <img
              src="/falcons-logo.png"
              alt="Hinterland Falcons Logo"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-sm font-bold text-sidebar-foreground truncate">
                Santasi AYM
              </span>
              <span className="text-[11px] text-sidebar-foreground/60 truncate">
                Pathfinder Admin
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          const isExternal = 'external' in item && item.external;

          return (
            <div key={item.path}>
              {isExternal && (
                <>
                  <div className="my-3 border-t border-sidebar-border" />
                  {!isCollapsed && (
                    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                      External Portals
                    </p>
                  )}
                </>
              )}
              <Link
                to={item.path}
                target={isExternal ? '_blank' : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isExternal
                    ? "text-sidebar-primary hover:bg-sidebar-accent hover:text-sidebar-primary"
                    : isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isExternal && "text-sidebar-primary")} />
                {!isCollapsed && (
                  <span className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {isExternal && (
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    )}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      {!hideCollapse && (
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
