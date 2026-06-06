/**
 * @file ProductCard.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ProductCard operations.
 * 
 * @relations
 * Interacts with: react-router-dom, shared, ../../lib/currency.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";
import type { Product } from "shared";
import { formatPrice } from "../../lib/currency";

interface ProductCardProps {
  product: Product;
  badge?: "new" | "bestseller";
}

export function ProductCard({ product, badge }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-text-main flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F9F9F9] p-6 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          loading="lazy"
        />
        
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-block bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
              {badge === "new" ? "New" : "Trending"}
            </span>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
            {product.brand}
          </p>
          <h3 className="font-display text-base font-semibold text-text-main line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-1">
            {product.concentration} • {product.notesTop.split(',')[0]}, {product.notesHeart.split(',')[0]}
          </p>
        </div>
        
        <p className="text-sm font-semibold text-text-main mb-4 mt-auto">
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto w-full border border-border rounded text-center py-2 text-xs font-medium text-text-main group-hover:bg-text-main group-hover:text-white transition-colors">
          View Product
        </div>
      </div>
    </Link>
  );
}
