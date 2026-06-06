/**
 * @file CheckoutPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for CheckoutPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../stores/cartStore, ../stores/authStore, ../components/ui/Button.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { formatPrice } from "../lib/currency";
import { ArrowLeft } from "lucide-react";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import toast from "react-hot-toast";
import { useAddresses } from "../hooks/useAddresses";
export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { addresses, addAddress } = useAddresses();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    note: "",
    shippingMethod: "REGULAR", // Only option for now
  });

  // Automatically fill address if user has a default one, or when they change the select
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === "new") {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData(prev => ({
          ...prev,
          address: defaultAddr.address,
          city: defaultAddr.city,
          province: defaultAddr.province,
          postalCode: defaultAddr.postalCode
        }));
      }
    }
  }, [addresses]);

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === "new") {
      setFormData(prev => ({ ...prev, address: "", city: "", province: "", postalCode: "" }));
      return;
    }
    const addr = addresses.find(a => a.id === val);
    if (addr) {
      setFormData(prev => ({
        ...prev,
        address: addr.address,
        city: addr.city,
        province: addr.province,
        postalCode: addr.postalCode
      }));
    }
  };

  // If cart is empty, redirect back to cart
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-text-muted mb-6">Add some products to your cart before checking out.</p>
        <Button onClick={() => navigate("/shop")}>Return to Shop</Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedAddressId === "new" && saveNewAddress) {
        await addAddress({
          title: "My Address",
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
        });
      }

      const orderData = {
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const res = await apiClient.post(API_ROUTES.ORDERS.CREATE, orderData);
      const newOrder = res.data.data.order;
      
      toast.success("Order created successfully!");
      clearCart();
      navigate(`/order-confirmation/${newOrder.id}`);
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Cart
      </Link>
      
      <h1 className="font-display text-3xl font-semibold text-text-main mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Contact Info */}
            <div className="bg-white border border-border/50 rounded-xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-text-main mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-1">Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Email Address</label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    placeholder="e.g. 08123456789"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-border/50 rounded-xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text-main">Shipping Address</h2>
                {addresses.length > 0 && (
                  <select 
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                    className="h-10 px-3 border border-border rounded text-sm focus:outline-none focus:border-text-main"
                  >
                    <option value="new">+ Add New Address</option>
                    {addresses.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.city})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-1">Full Address</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-4 border border-border rounded focus:outline-none focus:border-text-main resize-none"
                    placeholder="Street name, building, house number..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">City / District</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Province</label>
                  <input
                    type="text"
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-1">Order Notes (Optional)</label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    className="w-full h-11 px-4 border border-border rounded focus:outline-none focus:border-text-main"
                    placeholder="Any special instructions for delivery"
                  />
                </div>
                {selectedAddressId === "new" && (
                  <div className="sm:col-span-2 mt-2 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="saveNewAddress" 
                      checked={saveNewAddress} 
                      onChange={e => setSaveNewAddress(e.target.checked)}
                      className="w-4 h-4 text-text-main rounded focus:ring-text-main accent-text-main"
                    />
                    <label htmlFor="saveNewAddress" className="text-sm font-medium text-text-main cursor-pointer">
                      Save this address for future purchases
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Method Info */}
            <div className="bg-white border border-border/50 rounded-xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-text-main mb-4">Payment Method</h2>
              <div className="p-4 border border-border bg-[#F9F9F9] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <input type="radio" checked readOnly className="text-text-main focus:ring-text-main accent-text-main" />
                  <span className="font-medium text-text-main">Manual Bank Transfer</span>
                </div>
                <p className="text-sm text-text-muted ml-7">
                  You will receive our bank account details on the next page after placing the order. 
                  Your order will be processed once payment is confirmed.
                </p>
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-[#F9F9F9] border border-border/50 rounded-xl p-6 sm:p-8 sticky top-24">
            <h2 className="font-display text-xl font-semibold text-text-main mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-16 h-16 bg-white border border-border/50 rounded p-1 shrink-0 relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-text-main text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-text-main line-clamp-1">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.brand}</p>
                    <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
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
            </div>
            
            <Button 
              type="submit"
              form="checkout-form"
              size="lg" 
              className="w-full"
              isLoading={isLoading}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
