import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Compass,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Applications', path: '/admin/applications' },
  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminSidebar = ({ className }: { className?: string }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary flex-shrink-0">
          <Compass className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading text-sm font-bold text-sidebar-foreground">Santasi SDA</span>
            <span className="text-xs text-sidebar-foreground/60">Pathfinder Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>

        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-2">Exit Admin</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
