/**
 * @fileoverview Reusable Dropdown Select component for forms.
 * 
 * Relations:
 * - Consumes: Native HTML select attributes, `cn` utility.
 * - Used by: Forms requiring enum selection (e.g., choosing a category in `ProductsPage`).
 * 
 * Logic:
 * - Wraps native `<select>` using `forwardRef`.
 * - Maps over an `options` array (label/value pairs) to render `<option>` elements.
 * - Includes a default disabled placeholder option.
 */
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
