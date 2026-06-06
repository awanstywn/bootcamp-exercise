/**
 * @file Breadcrumbs.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for Breadcrumbs operations.
 * 
 * @relations
 * Interacts with: react-router-dom, lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center text-xs font-medium text-text-muted mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/" className="hover:text-text-main transition-colors">
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={14} className="mx-2 text-border" />
          {item.href ? (
            <Link to={item.href} className="hover:text-text-main transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
