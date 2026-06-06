/**
 * @file FilterSidebar.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for FilterSidebar operations.
 * 
 * @relations
 * Interacts with: lucide-react, react, ../ui/Button.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

const categories = [
  { label: "All Categories", value: "" },
  { label: "Women", value: "WOMEN" },
  { label: "Men", value: "MEN" },
  { label: "Unisex", value: "UNISEX" },
];

const scentFamilies = [
  { label: "Floral", value: "FLORAL" },
  { label: "Woody", value: "WOODY" },
  { label: "Fresh", value: "FRESH" },
  { label: "Oriental", value: "ORIENTAL" },
  { label: "Citrus", value: "CITRUS" },
  { label: "Gourmand", value: "GOURMAND" },
  { label: "Aquatic", value: "AQUATIC" },
];

interface FilterSidebarProps {
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

function AccordionSection({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <button 
        className="flex w-full items-center justify-between font-medium text-sm text-text-main mb-2 hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="pt-2 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

export function FilterSidebar({
  category, scentFamily, minPrice, maxPrice,
  onCategoryChange, onScentFamilyChange, onMinPriceChange, onMaxPriceChange, onClear,
}: FilterSidebarProps) {

  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text-main">Filters</h3>
        <button onClick={onClear} className="text-xs font-medium text-text-muted hover:text-text-main underline underline-offset-4">
          Clear All
        </button>
      </div>

      <AccordionSection title="Category" defaultOpen={true}>
        {categories.map((c) => (
          <label key={c.label} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={category === c.value}
                onChange={() => onCategoryChange(c.value)}
                className="w-4 h-4 rounded border-border text-[#1A1A1A] focus:ring-[#1A1A1A]/20 cursor-pointer"
              />
            </div>
            <span className={`text-sm ${category === c.value ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
              {c.label}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Scent Family" defaultOpen={true}>
        {scentFamilies.map((sf) => (
          <label key={sf.label} className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={scentFamily === sf.value}
              onChange={() => onScentFamilyChange(sf.value)}
              className="w-4 h-4 rounded border-border text-[#1A1A1A] focus:ring-[#1A1A1A]/20 cursor-pointer"
            />
            <span className={`text-sm ${scentFamily === sf.value ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'}`}>
              {sf.label}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Price Range (IDR)" defaultOpen={true}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase mb-1 block">Min</label>
            <input
              type="number"
              value={minPrice || ""}
              placeholder="0"
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-border rounded text-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase mb-1 block">Max</label>
            <input
              type="number"
              value={maxPrice || ""}
              placeholder="10000000"
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-border rounded text-sm focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>
      </AccordionSection>

      <div className="mt-6">
        <Button className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A]" onClick={onClear}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
