/**
 * @file GuestLoginCTA.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for GuestLoginCTA operations.
 * 
 * @relations
 * Interacts with: ../ui/Button, ../../hooks/useAuth, lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { User } from "lucide-react";

interface GuestLoginCTAProps {
  onSuccess: () => void;
}

export function GuestLoginCTA({ onSuccess }: GuestLoginCTAProps) {
  const { continueAsGuest } = useAuth();

  const handleGuest = () => {
    continueAsGuest();
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-text-main">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <Button variant="secondary" onClick={handleGuest} className="w-full h-12 text-text-main border-border text-base gap-2">
        <User size={18} />
        Continue as Guest
      </Button>
      <p className="text-xs text-center text-text-muted">
        Browse, add to cart and checkout as guest.
      </p>
    </div>
  );
}
