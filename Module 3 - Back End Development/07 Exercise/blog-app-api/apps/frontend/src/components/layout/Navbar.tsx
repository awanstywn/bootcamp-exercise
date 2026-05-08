// src/components/layout/Navbar.tsx
// Fixed-position navigation bar with glassmorphism styling.
// Renders different links based on authentication state:
//   - Guest: shows Login + Sign Up buttons that open modal forms.
//   - Authenticated: shows Dashboard, Profile links, user name, and Logout.
// Includes a responsive mobile hamburger menu for small screens.
// Login/Register modals are managed here via local state (showLogin, showRegister).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchToRegister = () => { setShowLogin(false); setShowRegister(true); };
  const switchToLogin = () => { setShowRegister(false); setShowLogin(true); };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-wide">
            Blog Apps<span className="gradient-text">.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-gray-400 transition hover:text-white">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-white">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to={`/profile/${user?.id}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-white">
                  <UserIcon size={16} /> Profile
                </Link>
                <span className="gradient-text text-sm font-semibold">
                  {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={14} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowRegister(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="text-gray-400 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-white/5 px-6 py-4 md:hidden animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm text-gray-400 hover:text-white">
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-gray-400 hover:text-white">
                    Dashboard
                  </Link>
                  <Link to={`/profile/${user?.id}`} onClick={() => setMobileOpen(false)} className="text-sm text-gray-400 hover:text-white">
                    Profile
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left text-sm text-red-400 hover:text-red-300">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowLogin(true); setMobileOpen(false); }} className="text-left text-sm text-gray-400 hover:text-white">Login</button>
                  <button onClick={() => { setShowRegister(true); setMobileOpen(false); }} className="text-left text-sm text-violet-400 hover:text-violet-300">Sign Up</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Welcome Back">
        <LoginForm onSuccess={() => setShowLogin(false)} onSwitchToRegister={switchToRegister} />
      </Modal>
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Join Blog Apps">
        <RegisterForm onSuccess={switchToLogin} onSwitchToLogin={switchToLogin} />
      </Modal>
    </>
  );
}
