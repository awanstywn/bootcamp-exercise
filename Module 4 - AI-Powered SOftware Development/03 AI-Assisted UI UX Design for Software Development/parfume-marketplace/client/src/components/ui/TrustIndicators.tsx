/**
 * @file TrustIndicators.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for TrustIndicators operations.
 * 
 * @relations
 * Interacts with: lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { ShieldCheck, Lock, Truck } from "lucide-react";

export function TrustIndicators() {
  return (
        <div className="border-y border-current/20 py-8 px-4 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-current/20">
        
        {/* Item 1 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:px-8 first:px-0 first:pt-0 pt-8 md:pt-0">
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current shrink-0">
            <ShieldCheck strokeWidth={1.5} size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">100% Original</h4>
            <p className="text-xs opacity-70">Verified fragrances from trusted sellers.</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:px-8 pt-8 md:pt-0">
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current shrink-0">
            <Lock strokeWidth={1.5} size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Secure Checkout</h4>
            <p className="text-xs opacity-70">Protected payment experience.</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:px-8 pt-8 md:pt-0 border-b-0 pb-0">
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current shrink-0">
            <Truck strokeWidth={1.5} size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Fast Delivery</h4>
            <p className="text-xs opacity-70">Reliable shipping options.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
