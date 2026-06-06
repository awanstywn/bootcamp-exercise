/**
 * @file Input.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Input operations.
 * 
 * @relations
 * Interacts with: ../../lib/cn, react, lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { cn } from "../../lib/cn";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, className, type, icon, labelRight, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-sm font-medium text-text-main">
              {label}
            </label>
          )}
          {labelRight && (
            <div className="text-sm">
              {labelRight}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          className={cn(
            "w-full h-12 px-4 bg-white border rounded-md text-sm text-text-main placeholder:text-text-light",
            "transition-all duration-200",
            "focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-primary/5",
            error ? "border-error ring-2 ring-error/10" : "border-border",
            icon && "pl-11",
            isPassword && "pr-12",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-muted transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}
