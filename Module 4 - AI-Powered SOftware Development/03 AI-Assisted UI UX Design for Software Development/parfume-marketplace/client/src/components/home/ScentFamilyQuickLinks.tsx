/**
 * @file ScentFamilyQuickLinks.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ScentFamilyQuickLinks operations.
 * 
 * @relations
 * Interacts with: react-router-dom.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";

const scentFamilies = [
  { id: "FLORAL", name: "Floral" },
  { id: "WOODY", name: "Woody" },
  { id: "FRESH", name: "Fresh" },
  { id: "ORIENTAL", name: "Oriental" },
  { id: "CITRUS", name: "Citrus" },
  { id: "GOURMAND", name: "Gourmand" },
  { id: "AQUATIC", name: "Aquatic" },
];

export function ScentFamilyQuickLinks() {
  return (
    <section className="py-12 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-semibold text-text-main mb-6">
          Shop by Scent Family
        </h2>
        
        {/* Horizontal scroll container on mobile, flex wrap on desktop */}
        <div className="flex overflow-x-auto pb-4 sm:pb-0 sm:flex-wrap gap-4 scrollbar-hide">
          {scentFamilies.map((family) => (
            <Link
              key={family.id}
              to={`/shop?scentFamily=${family.id}`}
              className="shrink-0 px-6 py-2 border border-border rounded-full text-sm font-medium text-text-main hover:border-text-main hover:bg-text-main hover:text-white transition-colors"
            >
              {family.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
