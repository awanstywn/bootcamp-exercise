/**
 * @file Navbar.tsx
 * @description Site navigation bar header component. Handles active link tracking,
 * authentication display states (login/logout/write post options), and mobile viewport dropdown menu.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Menu, X, Zap } from 'lucide-react';

/**
 * Array containing the primary public page links for navigation.
 */
const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Teams',    to: '/teams' },
  { label: 'Blog',     to: '/blog' },
  { label: 'Contact',  to: '/contact' },
];

/**
 * Responsive Header/Navbar component with Glassmorphic styles and state integration.
 */
const Navbar = () => {
  // Mobile dropdown open/close toggle state
  const [open, setOpen] = useState(false);
  
  // Extract user authorization state and handlers from Zustand store
  const { isAuthenticated, logout, user } = useAuthStore();
  
  // Detect current location path to determine active tab highlighting
  const { pathname } = useLocation();

  /**
   * Helper function to style links dynamically depending on whether they match the current browser path.
   * @param to The target path.
   * @returns Tailwind class string.
   */
  const linkClass = (to: string) =>
    `text-sm transition-colors ${
      pathname === to
        ? 'text-primary-500 font-semibold' // Highlights the active page link
        : 'text-gray-600 hover:text-primary-500' // Styling for default links
    }`;

  return (
    // Sticky top container with glassmorphic blur effects (backdrop-blur-md) and overlay order (z-50)
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="container-custom flex items-center justify-between h-16" role="navigation" aria-label="Main navigation">
 
        {/* Brand Logo & Homepage Link */}
        <Link to="/" className="flex items-center gap-2 text-dark-900 font-bold text-xl" aria-label="PayStream home">
          <Zap className="w-6 h-6 text-primary-500" aria-hidden="true" />
          <span>PayStream</span>
        </Link>
 
        {/* Desktop View Navigation Links: Hidden on mobile screens (hidden md:flex) */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {NAV_LINKS.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={linkClass(link.to)}>{link.label}</Link>
            </li>
          ))}
        </ul>
 
        {/* Desktop View Authentication Status Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Greets user using name or email username snippet */}
              <span className="text-sm text-gray-400 hidden lg:block">
                Hi, {user?.name ?? user?.email?.split('@')[0]}
              </span>
              {/* Option to create a new blog post, shielded behind ProtectedRoute */}
              <Link to="/blog/create" className="btn-primary py-2 px-4 text-sm">
                Write Post
              </Link>
              {/* Triggers Zustand logout handler */}
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            // Default option to log in
            <Link to="/login" className="btn-primary py-2 px-4 text-sm">Login</Link>
          )}
        </div>
 
        {/* Mobile Hamburguer Menu Button Toggle (hidden on desktop views) */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {/* Renders X icon if dropdown is open, else standard Menu icon */}
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
 
      {/* Mobile view expanded navigation drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          <ul className="flex flex-col gap-4 pt-4" role="list">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className={`block ${linkClass(link.to)}`} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Authenticated user menu drawer layout */}
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/blog/create" className="btn-primary text-sm py-2 px-4 block text-center" onClick={() => setOpen(false)}>
                    Write Post
                  </Link>
                </li>
                <li>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-sm text-red-500 w-full text-left py-2">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Unauthenticated menu login drawer layout
              <li>
                <Link to="/login" className="btn-primary text-sm py-2 px-4 block text-center" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;

