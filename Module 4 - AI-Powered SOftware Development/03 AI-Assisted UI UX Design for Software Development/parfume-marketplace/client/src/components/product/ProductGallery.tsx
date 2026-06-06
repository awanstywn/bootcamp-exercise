/**
 * @file ProductGallery.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ProductGallery operations.
 * 
 * @relations
 * Interacts with: react, lucide-react, shared.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "shared";

interface ProductGalleryProps {
  images?: ProductImage[];
  fallbackImageUrl: string;
  name: string;
}

export function ProductGallery({ images = [], fallbackImageUrl, name }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use product images if available, otherwise just use the fallback image in an array
  const displayImages = images.length > 0 
    ? images.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url)
    : [fallbackImageUrl];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square sm:aspect-4/5 bg-[#F9F9F9] rounded-xl flex items-center justify-center p-8 group border border-border/50">
        {displayImages.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-text-main shadow-sm hover:border-text-main transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <img
          src={displayImages[currentIndex]}
          alt={`${name} - view ${currentIndex + 1}`}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />

        {displayImages.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-text-main shadow-sm hover:border-text-main transition-colors z-10"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {displayImages.map((url, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentIndex(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#F9F9F9] rounded-md border p-2 flex items-center justify-center ${currentIndex === i ? 'border-text-main ring-1 ring-text-main' : 'border-border hover:border-text-light'} transition-all`}
            >
              <img 
                src={url} 
                alt={`Thumbnail ${i + 1}`} 
                className={`w-full h-full object-contain mix-blend-multiply ${currentIndex === i ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
