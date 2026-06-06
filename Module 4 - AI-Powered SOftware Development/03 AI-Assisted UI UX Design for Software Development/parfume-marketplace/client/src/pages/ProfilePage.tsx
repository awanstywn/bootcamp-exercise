/**
 * @file ProfilePage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ProfilePage operations.
 * 
 * @relations
 * Interacts with: react, ../stores/authStore, ../hooks/useAddresses, ../components/ui/Button, lucide-react.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useAddresses } from "../hooks/useAddresses";
import { Button } from "../components/ui/Button";
import { Plus, Trash2, CheckCircle2, Package, Upload } from "lucide-react";
import apiClient from "../lib/apiClient";
import useSWR from "swr";
import { formatPrice } from "../lib/currency";
import toast from "react-hot-toast";
import { API_ROUTES } from "../lib/routes";

// Fetcher for SWR
const fetcher = (url: string) => apiClient.get(url).then((res) => res.data.data);

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");
  const { addresses, isLoading: isAddressesLoading, addAddress, deleteAddress, setDefaultAddress } = useAddresses();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const { data: ordersData, error: ordersError, mutate: mutateOrders } = useSWR(
    API_ROUTES.ORDERS.LIST_MY_ORDERS,
    fetcher
  );

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addAddress(newAddress);
    if (success) {
      setIsAddingAddress(false);
      setNewAddress({ title: "", address: "", city: "", province: "", postalCode: "" });
    }
  };

  const handleUploadProof = async (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      await apiClient.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Payment proof uploaded successfully");
      mutateOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload proof");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-display text-3xl font-semibold text-text-main mb-8">My Profile</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-border/50 rounded-xl p-6">
            <div className="w-16 h-16 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-semibold text-text-main">{user.name}</h2>
            <p className="text-sm text-text-muted mb-6">{user.email}</p>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "orders" ? "bg-[#1A1A1A] text-white" : "text-text-muted hover:bg-bg-alt hover:text-text-main"
                }`}
              >
                <Package size={18} />
                My Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "addresses" ? "bg-[#1A1A1A] text-white" : "text-text-muted hover:bg-bg-alt hover:text-text-main"
                }`}
              >
                <CheckCircle2 size={18} />
                Saved Addresses
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-text-main mb-4">Order History</h2>
              
              {!ordersData && !ordersError && <p>Loading orders...</p>}
              {ordersData?.orders?.length === 0 && <p className="text-text-muted">You have no orders yet.</p>}
              
              <div className="space-y-6">
                {ordersData?.orders?.map((order: any) => (
                  <div key={order.id} className="bg-white border border-border/50 rounded-xl overflow-hidden">
                    <div className="bg-[#F9F9F9] border-b border-border/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-text-main">Order #{order.orderNumber}</p>
                        <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                          ${order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            order.status === "PENDING_PAYMENT" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "PAID" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        `}>
                          {order.status.replace("_", " ")}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text-main">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-[#F9F9F9] rounded border border-border/50 p-1 shrink-0">
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.productName}</p>
                            <p className="text-xs text-text-muted">{item.brand} • {item.volumeMl}ml</p>
                            <p className="text-sm font-medium mt-1">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status === "PENDING_PAYMENT" && (
                      <div className="border-t border-border/50 p-4 bg-yellow-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-yellow-800">Please upload your transfer proof to process this order.</p>
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-[#1A1A1A] text-white px-4 py-2 text-sm font-medium hover:bg-[#2A2A2A] transition-colors">
                          <Upload size={16} />
                          <span>Upload Proof</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadProof(order.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-text-main">Saved Addresses</h2>
                {!isAddingAddress && addresses.length < 5 && (
                  <Button size="sm" className="gap-2" onClick={() => setIsAddingAddress(true)}>
                    <Plus size={16} /> Add New
                  </Button>
                )}
              </div>

              {isAddressesLoading ? (
                <p>Loading addresses...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`border rounded-xl p-4 relative ${addr.isDefault ? "border-text-main bg-[#F9F9F9]" : "border-border/50"}`}>
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 text-xs font-semibold bg-text-main text-white px-2 py-0.5 rounded">Default</span>
                      )}
                      <h3 className="font-semibold text-text-main pr-16">{addr.title}</h3>
                      <p className="text-sm text-text-muted mt-2 line-clamp-2">{addr.address}</p>
                      <p className="text-sm text-text-muted">{addr.city}, {addr.province} {addr.postalCode}</p>
                      
                      <div className="mt-4 flex gap-3">
                        {!addr.isDefault && (
                          <button 
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-xs font-medium text-text-main hover:text-text-muted"
                          >
                            Set as Default
                          </button>
                        )}
                        <button 
                          onClick={() => deleteAddress(addr.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} className="inline mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && !isAddingAddress && (
                    <p className="text-text-muted col-span-2">You haven't saved any addresses yet.</p>
                  )}
                </div>
              )}

              {isAddingAddress && (
                <div className="bg-[#F9F9F9] border border-border/50 rounded-xl p-6 mt-6">
                  <h3 className="font-semibold mb-4">Add New Address</h3>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address Title (e.g., Home, Office)</label>
                        <input required type="text" value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} className="w-full h-10 px-3 border border-border rounded focus:border-text-main outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <textarea required value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} className="w-full p-3 border border-border rounded focus:border-text-main outline-none resize-none" rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input required type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full h-10 px-3 border border-border rounded focus:border-text-main outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Province</label>
                        <input required type="text" value={newAddress.province} onChange={e => setNewAddress({...newAddress, province: e.target.value})} className="w-full h-10 px-3 border border-border rounded focus:border-text-main outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <input required type="text" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} className="w-full h-10 px-3 border border-border rounded focus:border-text-main outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit">Save Address</Button>
                      <Button type="button" variant="secondary" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
