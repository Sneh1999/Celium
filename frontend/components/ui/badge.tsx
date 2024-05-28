import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-1 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success:
          "border-transparent bg-green-800 text-green-200 hover:bg-success/80",
        error: "border-transparent bg-red-800 text-red-200 hover:bg-error/80",
        warning:
          "border-transparent bg-yellow-800 text-yellow-200 hover:bg-warning/80",
        info: "border-transparent bg-blue-800 text-blue-200 hover:bg-info/80",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
