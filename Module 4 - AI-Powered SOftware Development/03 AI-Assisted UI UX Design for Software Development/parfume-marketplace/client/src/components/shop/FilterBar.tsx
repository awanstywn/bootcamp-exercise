/**
 * @file FilterBar.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for FilterBar operations.
 * 
 * @relations
 * Interacts with: ../../lib/cn.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { cn } from "../../lib/cn";

const categories = [
  { label: "All", value: "" },
  { label: "Men", value: "MEN" },
  { label: "Women", value: "WOMEN" },
  { label: "Unisex", value: "UNISEX" },
];

const scentFamilies = [
  { label: "All Scents", value: "" },
  { label: "Floral", value: "FLORAL" },
  { label: "Woody", value: "WOODY" },
  { label: "Fresh", value: "FRESH" },
  { label: "Oriental", value: "ORIENTAL" },
  { label: "Citrus", value: "CITRUS" },
  { label: "Aquatic", value: "AQUATIC" },
  { label: "Gourmand", value: "GOURMAND" },
  { label: "Aromatic", value: "AROMATIC" },
];

interface FilterBarProps {
  category: string;
  scentFamily: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (v: string) => void;
  onScentFamilyChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onClear: () => void;
}

export function FilterBar({
  category, scentFamily, minPrice, maxPrice,
  onCategoryChange, onScentFamilyChange, onMinPriceChange, onMaxPriceChange, onClear,
}: FilterBarProps) {
  const hasActiveFilters = category || scentFamily || minPrice || maxPrice;

  return (
    <div className="space-y-4">
      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(c.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
              category === c.value
                ? "bg-primary text-white"
                : "bg-bg-alt text-text-main hover:bg-primary/10"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Scent Family */}
        <select
          value={scentFamily}
          onChange={(e) => onScentFamilyChange(e.target.value)}
          className="h-10 px-3 bg-white border border-border rounded-md text-sm focus:outline-none focus:border-border-focus cursor-pointer"
        >
          {scentFamilies.map((sf) => (
            <option key={sf.value} value={sf.value}>{sf.label}</option>
          ))}
        </select>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="Min $"
            className="h-10 w-24 px-3 bg-white border border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
          />
          <span className="text-text-light">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Max $"
            className="h-10 w-24 px-3 bg-white border border-border rounded-md text-sm focus:outline-none focus:border-border-focus"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-accent hover:text-accent-light transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
