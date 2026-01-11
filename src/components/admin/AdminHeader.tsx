import { Bell, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              className="w-64 pl-9"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              3
            </span>
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">Club Director</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
