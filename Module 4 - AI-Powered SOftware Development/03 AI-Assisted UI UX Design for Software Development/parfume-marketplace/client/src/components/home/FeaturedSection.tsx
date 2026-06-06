/**
 * @file FeaturedSection.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for FeaturedSection operations.
 * 
 * @relations
 * Interacts with: react-router-dom, shared, ../shop/ProductCard.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";
import type { Product } from "shared";
import { ProductCard } from "../shop/ProductCard";

interface FeaturedSectionProps {
  title: string;
  products: Product[];
  linkTo?: string;
  badge?: "new" | "bestseller";
}

export function FeaturedSection({ title, products, linkTo = "/shop", badge }: FeaturedSectionProps) {
  if (!products.length) return null;

  return (
    <section className="py-12 border-b border-border/50 last:border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-text-main">{title}</h2>
          <Link
            to={linkTo}
            className="text-sm font-semibold text-text-main hover:text-primary transition-colors underline underline-offset-4"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}
