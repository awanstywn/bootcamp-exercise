/**
 * @fileoverview Side navigation menu.
 * 
 * Relations:
 * - Consumes: `react-router-dom` for navigation, `lucide-react` for iconography.
 * - Used by: `DashboardLayout.tsx`.
 * 
 * Logic:
 * - Iterates over a static `navigation` array to render links to Dashboard, Products, and Categories.
 * - Uses `NavLink` to automatically style the currently active route.
 */
import { LayoutDashboard, Package, Tags } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
];

export const Sidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">
          Product Dashboard
        </h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5 shrink-0",
                        isActive
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-500",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
