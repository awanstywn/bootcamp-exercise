/**
 * @file ProductDetailPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ProductDetailPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../hooks/useProducts, ../stores/authStore, ../stores/cartStore.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { GuestRegisterModal } from "../components/auth/GuestRegisterModal";
import { Button } from "../components/ui/Button";
import { ScentNotes } from "../components/product/ScentNotes";
import { Spinner } from "../components/ui/Spinner";
import { ShoppingCart } from "lucide-react";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { ProductGallery } from "../components/product/ProductGallery";
import { Tabs } from "../components/ui/Tabs";
import { TrustIndicators } from "../components/ui/TrustIndicators";
import { ProductCard } from "../components/shop/ProductCard";
import { formatPrice } from "../lib/currency";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, isLoading, error } = useProduct(slug!);
  
  // Need to fetch related products
  // we'll filter them client-side for simplicity, or we could pass query params
  const { data: relatedData } = useProducts({ 
    scentFamily: product?.scentFamily,
    limit: 5 // fetch a bit more to exclude current product
  });

  const { user, isGuest } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-text-muted mb-6">The fragrance you are looking for does not exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Return to Shop</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user || isGuest) {
      setIsGuestModalOpen(true);
      return;
    }

    if (product.stock < qty) {
      toast.error(`Only ${product.stock} items left in stock.`);
      return;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      volumeMl: product.volumeMl,
      imageUrl: product.imageUrl,
      stock: product.stock,
    }, qty);
    
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!user || isGuest) {
      setIsGuestModalOpen(true);
      return;
    }

    if (product.stock < qty) {
      toast.error(`Only ${product.stock} items left in stock.`);
      return;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      volumeMl: product.volumeMl,
      imageUrl: product.imageUrl,
      stock: product.stock,
    }, qty);
    
    navigate("/checkout");
  };

  const handleQtyChange = (delta: number) => {
    const newQty = qty + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQty(newQty);
    }
  };

  const relatedProducts = relatedData?.products
    .filter(p => p.id !== product.id)
    .slice(0, 4) || [];

  const breadcrumbItems = [
    { label: "Shop", href: "/shop" },
    { label: product.category.charAt(0) + product.category.slice(1).toLowerCase(), href: `/shop?category=${product.category}` },
    { label: product.brand, href: `/shop?search=${encodeURIComponent(product.brand)}` },
    { label: product.name }
  ];

  const tabData = [
    {
      id: "description",
      label: "Description",
      content: (
        <div className="prose prose-sm text-text-muted max-w-none whitespace-pre-wrap">
          {product.description || "No description available."}
        </div>
      )
    },
    {
      id: "notes",
      label: "Notes",
      content: <ScentNotes top={product.notesTop} heart={product.notesHeart} base={product.notesBase} />
    },
    {
      id: "details",
      label: "Details",
      content: (
        <div className="text-sm text-text-muted space-y-2">
          <p><strong>Concentration:</strong> {product.concentration}</p>
          <p><strong>Volume:</strong> {product.volumeMl} ml</p>
          <p><strong>Scent Family:</strong> {product.scentFamily}</p>
        </div>
      )
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      content: <p className="text-sm text-text-muted">Free shipping on all orders. Returns accepted within 30 days.</p>
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        {/* Product Gallery (Left) */}
        <div>
          <ProductGallery images={product.images} fallbackImageUrl={product.imageUrl} name={product.name} />
        </div>

        {/* Product Info (Right) */}
        <div className="flex flex-col py-2">
          <div className="mb-6">
            <h2 className="text-sm font-medium uppercase tracking-widest text-text-muted mb-2">
              {product.brand}
            </h2>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-main mb-3">
              {product.name}
            </h1>
            <p className="text-sm text-text-main mb-6">{product.concentration}</p>

            <div className="text-2xl sm:text-3xl font-semibold text-text-main mb-6">
              {formatPrice(product.price)}
            </div>

            <div className="text-sm text-text-main mb-2">
              <span className="font-semibold">Scent Family:</span> {product.scentFamily}
            </div>
            <div className="text-sm text-text-main mb-6">
              <span className="font-semibold">Concentration:</span> {product.concentration}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Size (Volume)</h3>
            <div className="flex flex-wrap gap-3">
              <div className="px-6 py-2 border-2 border-text-main bg-text-main text-white rounded text-sm font-medium transition-colors">
                {product.volumeMl} ml
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 10 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-600">In Stock</span>
              </>
            ) : product.stock > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-amber-600">Low Stock — only {product.stock} left</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              </>
            )}
            <span className="text-sm text-text-muted ml-2">• Free delivery available</span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Quantity</h3>
            <div className="flex items-center border border-border rounded w-32 h-12">
              <button 
                onClick={() => handleQtyChange(-1)}
                disabled={qty <= 1 || product.stock === 0}
                className="w-10 h-full flex items-center justify-center text-text-main hover:bg-[#F9F9F9] transition-colors disabled:opacity-50"
              >
                -
              </button>
              <div className="flex-1 text-center font-medium">{product.stock === 0 ? 0 : qty}</div>
              <button 
                onClick={() => handleQtyChange(1)}
                disabled={qty >= product.stock}
                className="w-10 h-full flex items-center justify-center text-text-main hover:bg-[#F9F9F9] transition-colors disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {user?.role !== "ADMIN" && (
            <>
              <div className="flex gap-4 mb-4">
                <Button 
                  size="lg" 
                  className="flex-1 gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A]" 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </Button>
              </div>
              
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full mb-8"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </>
          )}

          <div className="border-t border-border/50 pt-6">
            <div className="flex justify-between items-center text-sm text-text-muted">
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">✓</div> 100% Original</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">🔒</div> Secure Checkout</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">↺</div> Easy Returns</div>
            </div>
          </div>

        </div>
      </div>

      <div className="mb-16">
        <Tabs tabs={tabData} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold text-text-main">You may also like</h2>
            <Link to="/shop" className="text-sm font-medium text-text-main hover:text-primary transition-colors underline underline-offset-4">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border/50 pt-12">
        <TrustIndicators />
      </div>
      
      <GuestRegisterModal 
        isOpen={isGuestModalOpen} 
        onClose={() => setIsGuestModalOpen(false)} 
      />
    </div>
  );
}
