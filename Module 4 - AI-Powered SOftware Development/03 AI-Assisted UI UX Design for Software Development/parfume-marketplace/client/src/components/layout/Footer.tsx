/**
 * @file Footer.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Footer operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ../../hooks/useSettings.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";
import { useSettings } from "../../hooks/useSettings";

export function Footer() {
  const { settings } = useSettings();

  const getWhatsAppLink = () => {
    const number = settings?.whatsappNumber || "628888888888";
    // Format the number by removing any non-numeric characters
    const cleanNumber = number.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <footer className="bg-bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">PARFUME</h3>
            <p className="text-text-light text-sm leading-relaxed">
              Discover your signature scent. A curated marketplace of authentic designer and niche fragrances.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-text-light">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-text-light hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-sm text-text-light hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/shop?category=MEN" className="text-sm text-text-light hover:text-white transition-colors">Men's Fragrances</Link></li>
              <li><Link to="/shop?category=WOMEN" className="text-sm text-text-light hover:text-white transition-colors">Women's Fragrances</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-text-light">Contact & Help</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-text-light hover:text-white transition-colors"
                >
                  Contact via WhatsApp
                </a>
              </li>
              <li><Link to="/pages/about-us" className="text-sm text-text-light hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/pages/shipping" className="text-sm text-text-light hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/pages/returns" className="text-sm text-text-light hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-text-light">
          © {new Date().getFullYear()} Marketplace for Parfume. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
