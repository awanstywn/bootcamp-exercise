/**
 * @file Spinner.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Spinner operations.
 * 
 * @relations
 * Interacts with: lucide-react, ../../lib/cn.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return <Loader2 className={cn("animate-spin text-primary", sizes[size], className)} />;
}
