/**
 * @file Header.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Header operations.
 * 
 * @relations
 * Interacts with: react-router-dom, lucide-react, react, ../../stores/authStore, ../../stores/cartStore.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { user, isGuest, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      {user?.role === "ADMIN" && (
        <div className="bg-[#1A1A1A] text-white text-xs sm:text-sm font-medium py-2 px-4 flex justify-between items-center text-center">
          <div className="flex-1 text-center">
            You are viewing the store as an Admin.
          </div>
          <Link to="/admin" className="underline hover:text-gray-300 whitespace-nowrap ml-4">
            Return to Dashboard
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-primary">
            PARFUME
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-text-main hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-sm font-medium text-text-main hover:text-accent transition-colors">
              Shop
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-text-main hover:text-accent transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Icons */}
            <div className="flex items-center gap-4 text-text-main">
              {user && user.role !== "ADMIN" && (
                <Link to="/cart" className="relative p-2 hover:bg-bg-alt rounded-full transition-colors cursor-pointer">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 bg-[#1A1A1A] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Account */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile" className="text-sm font-medium text-text-main hover:text-accent transition-colors">
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-text-muted hover:text-accent transition-colors cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:flex p-2 text-text-main hover:text-accent transition-colors"
                aria-label={isGuest ? "Login" : "Account"}
              >
                <User size={20} />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-main cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search perfumes, brands..."
                className="w-full h-11 pl-11 pr-4 bg-white border border-border rounded-full text-sm focus:outline-none focus:border-border-focus transition-colors"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-bg">
          <nav className="flex flex-col px-4 py-4 gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-main py-2">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-main py-2">Shop</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-main py-2">My Profile ({user.name})</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-text-muted py-2 text-left cursor-pointer">Logout</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-text-main py-2">Login / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
