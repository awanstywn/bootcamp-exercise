/**
 * @file HeroSection.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for HeroSection operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ../ui/Button.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function HeroSection() {
  return (
    <section className="relative w-full bg-[#F9F9F9] overflow-hidden border-b border-border/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center min-h-[70vh]">
        {/* Left Text */}
        <div className="w-full md:w-1/2 px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-text-main leading-[1.1] mb-6">
            Discover Your<br />Signature Scent
          </h1>
          <p className="text-base sm:text-lg text-text-muted mb-10 max-w-md">
            Explore exclusive fragrances from niche and premium perfume houses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link to="/shop?sort=latest">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore New Arrivals
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-full relative flex items-center justify-center p-8">
          <div className="w-full h-full max-h-[600px] bg-white border border-border/50 rounded overflow-hidden flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200" 
              alt="Premium perfume collection" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
