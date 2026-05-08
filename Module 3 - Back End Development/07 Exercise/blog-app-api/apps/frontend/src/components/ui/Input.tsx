// src/components/ui/Input.tsx
// Reusable form input with optional label and error message display.
// Styled for the dark theme with focus ring animation and error border highlight.
// Uses forwardRef so it can be used with form libraries or direct DOM access.

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border bg-black/20 px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${
            error ? 'border-red-500/50' : 'border-white/10'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
