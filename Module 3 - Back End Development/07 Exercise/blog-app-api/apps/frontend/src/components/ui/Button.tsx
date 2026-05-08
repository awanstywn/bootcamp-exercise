// src/components/ui/Button.tsx
// Reusable button component with four visual variants (primary, outline, danger, ghost),
// three sizes, and a loading state. Uses Tailwind utility classes for styling.
// The `forwardRef` pattern allows parent components to access the underlying DOM element.

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5',
  outline:
    'bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white',
  ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
