/**
 * @file HomePage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for HomePage operations.
 * 
 * @relations
 * Interacts with: ../components/home/HeroSection, ../components/home/ScentFamilyQuickLinks, ../components/home/FeaturedSection, ../components/ui/TrustIndicators, ../hooks/useProducts.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { HeroSection } from "../components/home/HeroSection";
import { ScentFamilyQuickLinks } from "../components/home/ScentFamilyQuickLinks";
import { FeaturedSection } from "../components/home/FeaturedSection";
import { TrustIndicators } from "../components/ui/TrustIndicators";
import { useProducts } from "../hooks/useProducts";
import { Spinner } from "../components/ui/Spinner";

export default function HomePage() {
  const { data: newArrivals, isLoading: loadingNew } = useProducts({ sort: "latest", limit: 4 });
  const { data: bestSellers, isLoading: loadingBest } = useProducts({ sort: "popular", limit: 4 });
  // Using generic fetch for Editor's picks as placeholder
  const { data: editorsPicks, isLoading: loadingEditors } = useProducts({ limit: 4 });

  return (
    <>
      <HeroSection />

      <ScentFamilyQuickLinks />

      {loadingNew || loadingBest || loadingEditors ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <FeaturedSection
            title="New Arrivals"
            products={newArrivals?.products || []}
            linkTo="/shop?sort=latest"
            badge="new"
          />

          <FeaturedSection
            title="Best Sellers"
            products={bestSellers?.products || []}
            linkTo="/shop?sort=popular"
            badge="bestseller"
          />

          <FeaturedSection
            title="Editor's Picks"
            products={editorsPicks?.products || []}
            linkTo="/shop"
          />
        </>
      )}

      <TrustIndicators />
    </>
  );
}
