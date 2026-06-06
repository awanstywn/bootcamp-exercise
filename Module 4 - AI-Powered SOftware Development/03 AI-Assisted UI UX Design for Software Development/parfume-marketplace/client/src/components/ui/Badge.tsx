/**
 * @file Badge.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Badge operations.
 * 
 * @relations
 * Interacts with: ../../lib/cn.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { cn } from "../../lib/cn";

interface BadgeProps {
  variant?: "new" | "bestseller" | "concentration";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "concentration", children, className }: BadgeProps) {
  const variants = {
    new: "bg-accent text-white",
    bestseller: "bg-secondary text-white",
    concentration: "bg-secondary/10 text-secondary",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
