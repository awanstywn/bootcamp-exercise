/**
 * @file ShopPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ShopPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../components/shop/FilterSidebar, ../components/shop/SortDropdown, ../components/shop/ProductCard.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterSidebar } from "../components/shop/FilterSidebar";
import { SortDropdown } from "../components/shop/SortDropdown";
import { ProductCard } from "../components/shop/ProductCard";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { TrustIndicators } from "../components/ui/TrustIndicators";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import { Filter, X } from "lucide-react";
import type { Product, PaginatedResponse } from "shared";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const scentFamily = searchParams.get("scentFamily") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "popular";
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mobile filter drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (scentFamily) params.set("scentFamily", scentFamily);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await apiClient.get(`${API_ROUTES.PRODUCTS.LIST}?${params.toString()}`);
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [category, scentFamily, minPrice, maxPrice, sort, page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    setSearchParams(params);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    setSearchParams(params);
  };

  const totalPages = data?.pagination.totalPages || 1;

  const sidebarProps = {
    category,
    scentFamily,
    minPrice,
    maxPrice,
    onCategoryChange: (v: string) => updateParams({ category: v, page: 1 }),
    onScentFamilyChange: (v: string) => updateParams({ scentFamily: v, page: 1 }),
    onMinPriceChange: (v: string) => updateParams({ minPrice: v, page: 1 }),
    onMaxPriceChange: (v: string) => updateParams({ maxPrice: v, page: 1 }),
    onClear: clearFilters,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Shop" }]} />
        
        {/* Mobile Filter Drawer Overlay */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="relative flex-1 w-full max-w-xs bg-white h-full flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  <X className="h-6 w-6 text-gray-900" aria-hidden="true" />
                </button>
              </div>
              <div className="px-4 mt-8">
                <FilterSidebar {...sidebarProps} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-4">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar {...sidebarProps} />
          </div>

          {/* Main Grid Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-border/50 pb-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-text-main mb-1">
                  {search ? `Search results for "${search}"` : "All Perfumes"}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-text-muted text-sm font-medium">
                    {data ? `${data.pagination.total.toLocaleString()} products found` : "Loading..."}
                  </p>
                  {search && (
                    <button 
                      onClick={clearSearch}
                      className="text-xs bg-bg-alt text-[#1A1A1A] px-2 py-1 rounded-full hover:bg-border flex items-center gap-1"
                    >
                      Clear search <X size={12} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-medium border border-border px-4 py-2 rounded"
                >
                  <Filter size={16} /> Filters
                </button>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-sm font-medium text-text-muted">Sort by:</span>
                  <SortDropdown value={sort} onChange={(v) => updateParams({ sort: v, page: 1 })} />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : !data?.products.length ? (
              <EmptyState onAction={clearFilters} actionLabel="Reset Filters" />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} badge={product.stock < 10 ? 'bestseller' : undefined} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-12 gap-2">
                    <button 
                      disabled={page <= 1}
                      onClick={() => { updateParams({ page: page - 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="w-10 h-10 flex items-center justify-center border border-border rounded text-text-main hover:border-text-main disabled:opacity-50 transition-colors"
                    >
                      &lt;
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => { updateParams({ page: i + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors ${page === i + 1 ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]' : 'border border-border text-text-main hover:border-text-main'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    {totalPages > 5 && <span className="w-10 h-10 flex items-center justify-center text-text-muted">...</span>}
                    {totalPages > 5 && (
                      <button 
                        onClick={() => { updateParams({ page: totalPages }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors border border-border text-text-main hover:border-text-main`}
                      >
                        {totalPages}
                      </button>
                    )}
                    <button 
                      disabled={page >= totalPages}
                      onClick={() => { updateParams({ page: page + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="w-10 h-10 flex items-center justify-center border border-border rounded text-text-main hover:border-text-main disabled:opacity-50 transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[#1A1A1A] text-white">
        <TrustIndicators />
      </div>
    </>
  );
}
