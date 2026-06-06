/**
 * @file GuestRegisterModal.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for GuestRegisterModal operations.
 * 
 * @relations
 * Interacts with: lucide-react, react-router-dom, ../ui/Button.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

interface GuestRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestRegisterModal({ isOpen, onClose }: GuestRegisterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-main transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6 mt-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-display font-bold text-xl">P</span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-text-main mb-2">Create an Account</h2>
          <p className="text-sm text-text-muted">
            You are currently browsing as a guest. Please register or login to add items to your cart and proceed with purchases.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link to="/auth?view=register" className="w-full">
            <Button className="w-full" size="lg">
              Register to Continue
            </Button>
          </Link>
          <Link to="/auth?view=login" className="w-full text-center py-2 text-sm text-text-main font-medium hover:text-primary transition-colors">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
