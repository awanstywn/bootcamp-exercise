// src/components/layout/Footer.tsx
// Simple page footer with copyright and branding. Displayed at the bottom of every page.

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} <span className="gradient-text font-semibold">Blog Apps</span>. All rights reserved.</p>
    </footer>
  );
}
