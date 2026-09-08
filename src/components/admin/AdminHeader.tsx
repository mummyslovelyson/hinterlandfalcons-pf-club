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
import { Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAdminMobile } from '@/context/AdminMobileContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  syncNotificationsFromBackend,
  NOTIFICATIONS_UPDATED_EVENT,
  NotificationItem,
} from '@/lib/notifications';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

const AdminHeader = ({ title, subtitle, onMobileMenuToggle }: AdminHeaderProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications());
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toggle: toggleMobileSidebar } = useAdminMobile();

  const handleToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    } else {
      toggleMobileSidebar();
    }
  };

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
    toast.success('Signed out from Admin Portal');
    navigate('/admin/login');
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
    toast.info('Notifications cleared');
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    setNotifications(getNotifications());
    navigate(item.link);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
    setNotifications(getNotifications());
    toast.info('Notification dismissed');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-heading text-base sm:text-xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Open notifications"
                title={`${unreadCount} unread notifications`}
              >
                {/* SVG Bell icon */}
                <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-sm sm:max-w-md sm:w-96 p-0 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xl">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-foreground">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-7 text-[11px] px-2 text-slate-500 hover:text-slate-900 font-medium"
                    >
                      {/* SVG Check icon */}
                      <svg className="h-3 w-3 mr-1 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Mark read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="h-7 text-[11px] px-1.5 text-slate-400 hover:text-destructive"
                      title="Clear list"
                    >
                      {/* SVG Trash icon */}
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-slate-100 px-3 bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    notifFilter === 'all'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-foreground'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('unread')}
                  className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                    notifFilter === 'unread'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-foreground'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group p-3.5 transition-colors cursor-pointer hover:bg-slate-50 flex gap-3 items-start relative ${
                        !notif.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        <span
                          className={`flex h-2 w-2 rounded-full ${
                            !notif.read ? 'bg-primary' : 'bg-transparent'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5 pr-6">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {notif.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground leading-snug">{notif.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>

                      {/* Dismiss Single Item Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(e, notif.id)}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-destructive transition-opacity text-xs font-bold p-1 rounded hover:bg-slate-100"
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-foreground">No notifications</p>
                    <p>All club dispatches have been reviewed.</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile & Topbar Dropdown Menu */}
          <div className="pl-2 border-l border-slate-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Admin User Menu"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-xs">
                    AY
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-bold text-foreground leading-tight">Club Director</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Executive Admin ▾</p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-200 bg-white">
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold text-foreground">District Executive Admin</p>
                    <p className="text-[11px] text-slate-500">director@santasi-aym.org</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      Santasi AYM District
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-slate-100" />

                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link to="/" target="_blank" className="flex items-center justify-between w-full py-2 text-xs font-medium text-slate-700">
                    <span>Public Club Portal</span>
                    <span className="text-xs text-slate-400">↗</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link to="/church/login" target="_blank" className="flex items-center justify-between w-full py-2 text-xs font-medium text-slate-700">
                    <span>Church Portal Access</span>
                    <span className="text-xs text-slate-400">↗</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-50">
                  <Link to="/admin/settings" className="flex items-center justify-between w-full py-2 text-xs font-medium text-slate-700">
                    <span>Settings & Configuration</span>
                    <span className="text-xs text-slate-400">⚙</span>
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
      </div>
    </header>
  );
};

export default AdminHeader;
