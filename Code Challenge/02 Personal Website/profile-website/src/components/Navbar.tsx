/**
 * Navbar.tsx — Tab-Style Navigation
 *
 * Neo-Brutalist navigation with green active tab indicator.
 * Uses useThemeStore for active section tracking (Intersection Observer).
 * Responsive: horizontal tabs on desktop, hamburger on mobile.
 */

import { useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import type { NavItem } from "../types";

interface NavbarProps {
  navItems: NavItem[];
}

export function Navbar({ navItems }: NavbarProps) {
  const { activeSection, mobileMenuOpen, theme, setActiveSection, closeMobileMenu, toggleMobileMenu, setTheme } = useThemeStore();

  // Intersection Observer to track active section
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems, setActiveSection]);

  const handleNavClick = (href: string) => {
    closeMobileMenu();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      id="main-nav"
      className="fixed top-0 left-0 right-0 z-50 border-b-2 border-border"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6 py-2">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#home");
          }}
          className="font-heading text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          AS<span style={{ color: "var(--color-accent)" }}>.</span>
        </a>

        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={`nav-tab ${
                  activeSection === item.href.replace("#", "") ? "active" : ""
                }`}
              >
                &gt; {item.label.replace(/ /g, "_")}
              </a>
            </li>
          ))}
          <li className="ml-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 border-2 border-border hover:bg-bg-card transition-colors flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <a
            href="#home"
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            AS<span style={{ color: "var(--color-accent)" }}>.</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 border-2 border-border hover:bg-bg-card transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => toggleMobileMenu()}
              className="p-2 border-2 border-border hover:bg-bg-card transition-colors"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div
            className="animate-slide-down border-t-2 border-border"
            style={{ background: "var(--color-bg-card)" }}
          >
            <ul className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`block py-2 px-3 font-mono text-sm font-bold uppercase tracking-wider transition-colors ${
                      activeSection === item.href.replace("#", "")
                        ? "bg-accent text-text-primary"
                        : "hover:bg-bg-primary"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    &gt; {item.label.replace(/ /g, "_")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
