/**
 * HelloSection Component
 *
 * This is the landing/hero section of the portfolio website. It displays:
 * - A responsive navigation bar with hamburger menu for mobile
 * - Profile photo of the user
 * - User's name and title
 * - A brief description
 * - A "Hire Me" call-to-action button
 *
 * Features:
 * - Mobile-first responsive design with media queries
 * - Interactive hamburger menu that toggles on small screens
 * - Fixed navigation bar that stays visible while scrolling
 * - Dynamic article selection ("a" vs "an") based on title
 * - Scroll indicator arrow on desktop
 */

import { useState } from 'react'

interface HelloSectionProps {
  name: string;
  title: string;
  description: string;
  photoUrl: string;
  navItems: { label: string; href: string }[];
}

export function HelloSection({ name, title, description, photoUrl, navItems }: HelloSectionProps) {
  // State to control mobile menu open/close
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <section id="home" className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-6 sm:px-8 md:px-12 lg:px-4">
      {/* Navigation Bar - Fixed/Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        {/* Desktop Navigation - Hidden on mobile, visible on tablet+ */}
        <ul className="hidden md:flex justify-center space-x-8 py-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="text-sm text-gray-400 hover:text-white font-medium transition-colors duration-300"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button - Visible only on mobile (< 768px) */}
        <div className="md:hidden flex justify-between items-center px-6 py-3">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={toggleMobileMenu}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close Icon (X) - Shown when menu is open
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon (☰) - Shown when menu is closed
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu - Slides down when toggled */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="px-6 pb-4 space-y-3">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block text-sm text-gray-400 hover:text-white font-medium transition-colors duration-300 py-2 border-b border-gray-800"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Profile Photo - Responsive sizing */}
      <div className="mb-8 mt-20 md:mt-16">
        <img
          src={photoUrl}
          alt={`${name}'s profile`}
          className="w-28 h-28 md:w-36 md:h-36 rounded-xl object-cover border-2 border-gray-800"
        />
      </div>

      {/* Content Section */}
      <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-4">Get To Know More</p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
        {name}
      </h1>
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-400 mb-8 text-center max-w-3xl">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-gray-400 max-w-3xl text-center leading-relaxed mb-10">
        {description}
      </p>

      {/* Hire Me Button - Call to Action */}
      <a
        href="#contact"
        className="px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300 text-sm md:text-base"
      >
        Hire Me
      </a>

      {/* Scroll Indicator - Animated bouncing arrow, hidden on mobile */}
      <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
