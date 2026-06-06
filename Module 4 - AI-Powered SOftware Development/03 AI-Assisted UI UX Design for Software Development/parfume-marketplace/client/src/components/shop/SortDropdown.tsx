/**
 * @file SortDropdown.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for SortDropdown operations.
 * 
 * @relations
 * Interacts with: lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { ChevronDown } from "lucide-react";

const sortOptions = [
  { label: "Newest", value: "latest" },
  { label: "Price: Low → High", value: "priceAsc" },
  { label: "Price: High → Low", value: "priceDesc" },
  { label: "Popularity", value: "popular" },
];

interface SortDropdownProps {
  value: string;
  onChange: (v: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-sm text-text-muted">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none h-10 pl-3 pr-9 bg-white border border-border rounded-md text-sm font-medium focus:outline-none focus:border-border-focus cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}
