/**
 * @file AdminLayout.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminLayout operations.
 * 
 * @relations
 * Interacts with: react-router-dom, ../../stores/authStore.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Store,
  FileText
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Check if user is logged in and is an ADMIN
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Pages", href: "/admin/pages", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A1A1A] text-white flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/admin" className="font-display text-xl font-bold tracking-tight">
            PARFUME <span className="text-white/50 font-normal">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-white/50"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white/70 hover:bg-white/5 hover:text-white transition-colors">
            <Store className="mr-3 h-5 w-5 shrink-0 text-white/50" />
            View Store
          </Link>
          <button 
            onClick={() => { logout(); window.location.href = "/"; }}
            className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-border flex items-center justify-between px-4">
          <Link to="/admin" className="font-display text-lg font-bold tracking-tight">
            PARFUME ADMIN
          </Link>
          <button className="text-text-main">
            {/* Mobile menu toggle could go here */}
            Menu
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
