import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:brightness-110",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:brightness-105",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:brightness-110",
        outline: "text-foreground",
        success: "border-transparent bg-emerald text-white hover:brightness-110",
        rose: "border-transparent bg-rose text-white hover:brightness-110",
        violet: "border-transparent bg-violet text-white hover:brightness-110",
        sky: "border-transparent bg-sky text-white hover:brightness-110",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
