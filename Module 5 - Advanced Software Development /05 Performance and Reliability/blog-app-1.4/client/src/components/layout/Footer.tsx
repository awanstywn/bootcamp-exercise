import { NavLink } from 'react-router-dom';

const footerNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-slate-900 font-bold' : 'hover:text-slate-900 transition-colors';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <span className="font-bold text-xl font-serif tracking-normal text-slate-900">
              BlogApp
            </span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
            A platform for sharing knowledge and ideas. Read. Learn. Grow.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex gap-6 text-sm text-slate-500 font-medium">
          <NavLink to="/" className={footerNavLinkClass}>
            Home
          </NavLink>
          <NavLink to="/categories" className={footerNavLinkClass}>
            Categories
          </NavLink>
          <NavLink to="/tags" className={footerNavLinkClass}>
            Tags
          </NavLink>
          <NavLink to="/authors" className={footerNavLinkClass}>
            Authors
          </NavLink>
          <NavLink to="/about" className={footerNavLinkClass}>
            About
          </NavLink>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} BlogApp. All rights reserved.</p>
        <div className="flex gap-4">
          <NavLink to="/privacy" className={footerNavLinkClass}>
            Privacy Policy
          </NavLink>
          <NavLink to="/terms" className={footerNavLinkClass}>
            Terms of Service
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
