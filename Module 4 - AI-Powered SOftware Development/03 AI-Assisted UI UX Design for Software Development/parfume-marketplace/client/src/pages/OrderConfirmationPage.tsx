/**
 * @file OrderConfirmationPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for OrderConfirmationPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../components/ui/Button, ../components/ui/Spinner, ../lib/currency.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { formatPrice } from "../lib/currency";
import { useSettings } from "../hooks/useSettings";
import { CheckCircle2, Copy, ExternalLink, ArrowRight } from "lucide-react";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import toast from "react-hot-toast";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await apiClient.get(API_ROUTES.ORDERS.GET_BY_ID(id!));
        setOrder(res.data.data.order);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getWhatsAppLink = () => {
    if (!settings?.whatsappNumber || !order) return "#";
    
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    const message = `Hello PARFUME, I want to confirm payment for my order.
    
*Order Number:* ${order.orderNumber}
*Name:* ${order.customerName}
*Total:* ${formatPrice(order.total)}

[Please attach your payment proof here]`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-text-muted mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/shop">
          <Button>Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display text-3xl font-semibold text-text-main mb-4">
          Order Successfully Placed!
        </h1>
        <p className="text-text-muted">
          Thank you for your purchase. Your order number is <span className="font-bold text-text-main">{order.orderNumber}</span>.
        </p>
      </div>

      <div className="bg-white border border-border/50 rounded-xl overflow-hidden shadow-sm mb-8">
        
        {/* Payment Instructions Header */}
        <div className="bg-[#1A1A1A] text-white p-6 sm:px-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Awaiting Payment</h2>
          <p className="text-white/80 text-sm">
            Please complete your payment to the following bank account to process your order.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Bank Details */}
          <div className="bg-[#F9F9F9] border border-border/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-text-muted">Total Amount</span>
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-bold text-text-main">
                  {formatPrice(order.total)}
                </span>
                <button 
                  onClick={() => copyToClipboard(order.total.toString(), "Amount")}
                  className="p-2 text-text-muted hover:text-text-main bg-white rounded border border-border/50 shadow-sm transition-colors"
                  aria-label="Copy amount"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-4">
                <span className="text-sm text-text-muted">Bank Name</span>
                <span className="font-medium text-text-main">{settings?.bankName || "ABC Bank"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-4">
                <span className="text-sm text-text-muted">Account Name</span>
                <span className="font-medium text-text-main">{settings?.bankAccountName || "Parfume Store"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-4">
                <span className="text-sm text-text-muted">Account Number</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold text-text-main tracking-wider">
                    {settings?.bankAccountNo || "1234567890"}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(settings?.bankAccountNo || "1234567890", "Account number")}
                    className="p-1.5 text-text-muted hover:text-text-main bg-white rounded border border-border/50 shadow-sm transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Confirmation */}
          <div className="text-center">
            <h3 className="font-semibold text-text-main mb-2">Already transferred?</h3>
            <p className="text-sm text-text-muted mb-6">
              Click the button below to confirm your payment with us via WhatsApp. 
              Don't forget to attach your payment proof!
            </p>
            <a 
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Confirm Payment via WhatsApp
              <ExternalLink size={16} className="ml-1 opacity-70" />
            </a>
          </div>
          
        </div>
      </div>

      {/* Order Items Overview */}
      <div className="bg-white border border-border/50 rounded-xl p-6 sm:p-8">
        <h3 className="font-semibold text-text-main mb-6">Order Details</h3>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 divide-y divide-border/50">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
              <div className="w-16 h-16 bg-[#F9F9F9] rounded shrink-0 p-1">
                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-main line-clamp-1">{item.productName}</p>
                <p className="text-xs text-text-muted mt-1">{item.brand} • {item.volumeMl}ml</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-main">{formatPrice(item.price)}</p>
                <p className="text-xs text-text-muted mt-1">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-text-main hover:text-accent transition-colors">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
