/**
 * @file CartPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for CartPage operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ../stores/cartStore, ../components/ui/Button, ../lib/currency, lucide-react.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { Button } from "../components/ui/Button";
import { formatPrice } from "../lib/currency";
import { Trash2, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { TrustIndicators } from "../components/ui/TrustIndicators";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const handleQtyChange = (productId: string, currentQty: number, maxStock: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      updateQuantity(productId, newQty);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
        <Breadcrumbs items={[{ label: "Shopping Cart" }]} />

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-main mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-border/50 rounded-xl bg-[#F9F9F9]">
            <h2 className="text-xl font-medium text-text-main mb-3">Your cart is empty</h2>
            <p className="text-text-muted mb-8">Looks like you haven't added any fragrances yet.</p>
            <Link to="/shop">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items List */}
            <div className="flex-1">
              <div className="border border-border/50 rounded-xl overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 bg-[#F9F9F9] p-4 text-sm font-medium text-text-muted uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                <div className="divide-y divide-border/50">
                  {items.map((item) => (
                    <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center">
                      
                      {/* Product Info */}
                      <div className="col-span-6 flex gap-4 w-full">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bg-alt rounded-md p-2 shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-1">
                            {item.brand}
                          </p>
                          <Link to={`/products/${item.productId}`} className="font-semibold text-text-main hover:text-accent transition-colors line-clamp-1 mb-1">
                            {item.name}
                          </Link>
                          <p className="text-xs text-text-muted mb-2">
                            {item.volumeMl} ml
                          </p>
                          <div className="text-sm font-medium">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-3 flex items-center justify-between sm:justify-center w-full mt-2 sm:mt-0">
                        <span className="sm:hidden text-sm text-text-muted">Quantity</span>
                        <div className="flex items-center border border-border rounded h-10 w-28">
                          <button 
                            onClick={() => handleQtyChange(item.productId, item.quantity, item.stock, -1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-text-main hover:bg-[#F9F9F9] transition-colors disabled:opacity-50"
                          >
                            -
                          </button>
                          <div className="flex-1 text-center font-medium text-sm">{item.quantity}</div>
                          <button 
                            onClick={() => handleQtyChange(item.productId, item.quantity, item.stock, 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-full flex items-center justify-center text-text-main hover:bg-[#F9F9F9] transition-colors disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-3 flex items-center justify-between sm:justify-end w-full mt-2 sm:mt-0">
                        <span className="sm:hidden text-sm text-text-muted">Total</span>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-text-main">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button 
                            onClick={() => removeItem(item.productId)}
                            className="text-text-muted hover:text-red-500 transition-colors p-2"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-text-main hover:text-accent transition-colors">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-[#F9F9F9] border border-border/50 rounded-xl p-6 sm:p-8 sticky top-24">
                <h2 className="font-display text-xl font-semibold text-text-main mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-text-main">Total</span>
                    <span className="font-display text-2xl font-bold text-text-main">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted text-right mt-1">Includes all applicable taxes</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-6">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current">🔒</span>
                  Secure & Encrypted Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#1A1A1A] text-white py-12">
        <TrustIndicators />
      </div>
    </div>
  );
}
