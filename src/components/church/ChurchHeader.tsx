import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useChurchAuth } from '@/context/ChurchAuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  syncNotificationsFromBackend,
  NOTIFICATIONS_UPDATED_EVENT,
  NotificationItem,
} from '@/lib/notifications';

interface ChurchHeaderProps {
  onMobileMenuToggle?: () => void;
}

const ChurchHeader = ({ onMobileMenuToggle }: ChurchHeaderProps) => {
  const navigate = useNavigate();
  const { church, logout } = useChurchAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications());

  const refreshNotifs = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    refreshNotifs();
    syncNotificationsFromBackend().then((list) => {
      if (list && list.length > 0) setNotifications(list);
    });
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotifs);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotifs);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    toast.success('Signed out from Church Portal');
    navigate('/church/login');
  };

  const churchInitials = church?.name
    ? church.name
        .split(' ')
        .filter((w) => !['SDA', 'Church', 'Seventh-day', 'Adventist'].includes(w))
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'CH'
    : 'CH';

  // Filter notifications for this church or general dispatches
  const churchNotifications = notifications.filter(
    (n) => !n.church || n.church.toLowerCase().includes((church?.name || '').toLowerCase()) || (church?.name || '').toLowerCase().includes(n.church.toLowerCase())
  );
  const unreadCount = churchNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile menu trigger */}
          {onMobileMenuToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMobileMenuToggle}
              className="md:hidden h-9 px-2.5 border-slate-200"
              aria-label="Open sidebar menu"
            >
              Menu
            </Button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-amber-400 bg-primary/20 p-0.5 shadow-xs flex-shrink-0">
              <img src="/falcons-logo.png" alt="Club Crest" className="h-full w-full object-cover rounded-full" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-sm sm:text-base font-bold text-foreground truncate leading-tight">
                {church?.name || 'Local Church Portal'}
              </h1>
              <p className="text-[11px] text-slate-500 truncate leading-tight">
                Santasi AYM District Unit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Church notifications"
                title={`${unreadCount} notifications for your congregation`}
              >
                <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 sm:w-88 p-0 shadow-xl rounded-xl border-slate-200 bg-white overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-foreground">Unit Dispatches</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      markAllNotificationsAsRead();
                      refreshNotifs();
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {churchNotifications.length > 0 ? (
                  churchNotifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        refreshNotifs();
                        navigate('/church/members');
                      }}
                      className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{n.category}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground">{n.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No unit dispatches right now.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile & Topbar Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Church user menu"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-xs">
                  {churchInitials}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">
                    {church?.name || 'Church Director'}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Church Clerk ▾</p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl rounded-xl border-slate-200 bg-white">
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{church?.name || 'Church Unit'}</p>
                  <p className="text-[11px] text-slate-500">{church?.pastorName || 'Local Church Unit'}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    Santasi AYM Fellowship
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                <Link to="/" target="_blank" className="flex items-center justify-between w-full py-2 text-xs font-medium text-slate-700">
                  <span>Main Club Website</span>
                  <span className="text-xs text-slate-400">↗</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                <Link to="/admin/login" className="flex items-center justify-between w-full py-2 text-xs font-medium text-slate-700">
                  <span>District Headquarters Login</span>
                  <span className="text-xs text-slate-400">→</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive py-2 text-xs font-semibold"
              >
                Sign Out from Portal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ChurchHeader;
