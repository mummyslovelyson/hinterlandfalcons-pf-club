import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Flame,
    Inbox,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import { getChurchApplications, syncChurchApplicationsFromBackend, CHURCH_APPLICATIONS_SYNC_EVENT } from '@/lib/churches';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/church' },
    { icon: Users, label: 'Members', path: '/church/members' },
    { icon: Flame, label: 'Youth Ministry', path: '/church/youth' },
    { icon: Inbox, label: 'Applications', path: '/church/applications', badgeKey: 'applications' },
    { icon: Settings, label: 'Settings', path: '/church/settings' },
];

interface ChurchSidebarProps {
    onNavigate?: () => void;
    hideCollapse?: boolean;
}

const ChurchSidebar = ({ onNavigate, hideCollapse }: ChurchSidebarProps) => {
    const location = useLocation();
    const { church } = useChurchAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [pendingAppsCount, setPendingAppsCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const apps = getChurchApplications();
            const pending = apps.filter(a => a.status === 'pending').length;
            setPendingAppsCount(pending);
        };
        updateCount();
        syncChurchApplicationsFromBackend().then(() => updateCount());
        window.addEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, updateCount);
        return () => window.removeEventListener(CHURCH_APPLICATIONS_SYNC_EVENT, updateCount);
    }, []);

    const isActive = (path: string) => {
        if (path === '/church') return location.pathname === '/church';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className={cn(
                'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-full',
                collapsed && !hideCollapse ? 'w-16' : 'w-64'
            )}
        >
            {/* Header / Crest */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
                <Link to="/church" onClick={onNavigate} className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-amber-400/70 shadow-sm flex-shrink-0 bg-primary/20 p-0.5">
                        <img
                            src="/falcons-logo.png"
                            alt="Hinterland Falcons Logo"
                            className="h-full w-full object-cover rounded-full"
                        />
                    </div>
                    {(!collapsed || hideCollapse) && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-heading text-sm font-bold text-sidebar-foreground truncate">
                                {church?.name || 'Local Church'}
                            </span>
                            <span className="text-[11px] text-sidebar-foreground/60 truncate">Member Management</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            )}
                        >
                            <div className="relative">
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {collapsed && !hideCollapse && item.badgeKey === 'applications' && pendingAppsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-sidebar" />
                                )}
                            </div>
                            {(!collapsed || hideCollapse) && (
                                <div className="flex items-center justify-between flex-1 min-w-0">
                                    <span className="truncate">{item.label}</span>
                                    {item.badgeKey === 'applications' && pendingAppsCount > 0 && (
                                        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white shadow-xs">
                                            {pendingAppsCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer with collapse toggle only */}
            {!hideCollapse && (
                <div className="p-3 border-t border-sidebar-border">
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

export default ChurchSidebar;
