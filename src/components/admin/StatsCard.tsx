import { isValidElement, type ComponentType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ComponentType<{ className?: string }> | ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
}

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon,
  description, 
  trend,
}: StatsCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="flex items-center gap-2">
          {trend ? (
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              trend.isPositive ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-600'
            )}>
              {trend.isPositive ? '↑ +' : '↓ -'}{trend.value}%
            </span>
          ) : null}
          {Icon ? (
            <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
              {isValidElement(Icon) ? Icon : typeof Icon === 'function' ? <Icon className="h-4 w-4" /> : null}
            </div>
          ) : null}
        </div>
      </div>
      
      <div>
        <p className="font-heading text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1.5">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

