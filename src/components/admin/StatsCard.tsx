import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-primary/5 border-primary/20',
  accent: 'bg-accent/10 border-accent/20',
  success: 'bg-forest/5 border-forest/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-forest/10 text-forest',
};

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  variant = 'default' 
}: StatsCardProps) => {
  return (
    <div className={cn(
      'rounded-xl border p-6 shadow-soft transition-all duration-200 hover:shadow-card',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg',
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-forest' : 'text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-heading text-3xl font-bold text-foreground mt-1">{value}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
