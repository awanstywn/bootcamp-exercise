/**
 * @file AuthPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AuthPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../stores/authStore, ../components/auth/LoginForm, ../components/auth/RegisterForm.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { GuestLoginCTA } from "../components/auth/GuestLoginCTA";
import { TrustIndicators } from "../components/ui/TrustIndicators";

export default function AuthPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialView = queryParams.get("view") === "register" ? "register" : "login";
  
  const [view, setView] = useState<"login" | "register">(initialView);
  const { user } = useAuthStore();

  // Redirect based on role if already logged in
  if (user) {
    const from = location.state?.from?.pathname || (user.role === "ADMIN" ? "/admin" : "/");
    return <Navigate to={from} replace />;
  }

  const handleSuccess = () => {
    // Rely on the Navigate component above to handle the actual redirection
    // when the user state updates.
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-[#F9F9F9] px-6 pt-16 pb-0 flex-col items-center text-center relative overflow-hidden justify-between">
          <div className="max-w-md mx-auto relative z-10 flex flex-col items-center mt-12">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center">
              <div className="w-8 h-10 border-2 border-text-main rounded-t-lg rounded-b-sm mb-3 flex items-start justify-center pt-1">
                <div className="w-2.5 h-1.5 border border-text-main rounded-sm" />
              </div>
              <h1 className="font-display text-xl font-semibold tracking-widest uppercase leading-snug">
                Marketplace<br />For Parfume
              </h1>
            </div>

            <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-medium text-text-main mb-6 leading-tight">
              Discover.<br />Choose.<br />Make It Yours.
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto mb-8">
              Sign in to save your favorites, track orders, and enjoy a personalized fragrance experience.
            </p>
          </div>

          {/* Perfume Bottle Image Placeholder */}
          <div className="w-full max-w-[320px] mx-auto z-0 -mb-4">
            <img 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" 
              alt="Luxury Perfume" 
              className="w-full h-auto object-contain mix-blend-multiply opacity-90"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center py-12 px-4 sm:px-12 lg:px-20 relative z-10">
          <div className="mx-auto w-full max-w-[480px]">
            {/* Card Container for Desktop, transparent for mobile */}
            <div className="bg-white rounded-xl lg:border lg:border-border lg:p-10 lg:shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-border mb-8">
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 pb-4 text-center font-medium text-sm transition-colors cursor-pointer ${
                    view === "login"
                      ? "border-b-2 border-text-main text-text-main"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 pb-4 text-center font-medium text-sm transition-colors cursor-pointer ${
                    view === "register"
                      ? "border-b-2 border-text-main text-text-main"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Content */}
              <div>
                {view === "login" ? (
                  <LoginForm onSuccess={handleSuccess} />
                ) : (
                  <RegisterForm onSuccess={handleSuccess} />
                )}

                <div className="mt-8">
                  <GuestLoginCTA onSuccess={handleSuccess} />
                </div>

                {/* Bottom Toggle Text */}
                <div className="mt-8 text-center pt-8">
                  {view === "login" ? (
                    <>
                      <p className="text-xs text-text-main font-medium mb-1">
                        New to Marketplace for Parfume?
                      </p>
                      <button
                        onClick={() => setView("register")}
                        className="text-xs font-semibold text-text-main hover:text-primary transition-colors cursor-pointer"
                      >
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-text-main font-medium mb-1">
                        Already have an account?
                      </p>
                      <button
                        onClick={() => setView("login")}
                        className="text-xs font-semibold text-text-main hover:text-primary transition-colors cursor-pointer"
                      >
                        Login here
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <TrustIndicators />
      </div>
    </div>
  );
}
