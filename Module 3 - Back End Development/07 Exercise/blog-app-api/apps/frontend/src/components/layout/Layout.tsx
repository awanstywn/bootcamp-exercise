// src/components/layout/Layout.tsx
// Root layout wrapper — renders on every route via React Router's <Outlet />.
// Structure: background glow orbs → Navbar → page content → Footer.
// The glow orbs are fixed-position decorative elements that create the ambient background effect.

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="relative min-h-screen">
      {/* Background glow orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />

      <Navbar />
      <main className="relative z-10 mx-auto min-h-[calc(100vh-160px)] max-w-7xl px-6 pt-24 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
