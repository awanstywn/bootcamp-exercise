/**
 * @file Footer.tsx
 * @description Global footer component containing brand information, social icons,
 * hierarchical site navigation links, legal policy links, and dynamic copyright year.
 */

import { Link } from 'react-router-dom';
import { Zap, Globe, MessageCircle, Link as LinkIcon } from 'lucide-react';

/**
 * Footer component that renders the footer section at the bottom of the layout shell.
 */
const Footer = () => (
  <footer className="bg-dark-900 text-white py-12 mt-20">
    <div className="container-custom">
      {/* 4-column responsive grid layout for brand details, links, and legal sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand details and social profiles column */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary-500" aria-hidden="true" />
            <span className="font-bold text-lg">PayStream</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Modern payment infrastructure for the internet. Trusted by startups
            and enterprises in 195 countries.
          </p>
          {/* Social media connections */}
          <div className="flex gap-4 mt-4">
            <a href="https://github.com/paystream" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/paystream" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/company/paystream" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
              <LinkIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Company navigation links column */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {/* Dynamic listing of links for easier maintenance */}
            {[
              { label: 'About',    to: '/about' },
              { label: 'Services', to: '/services' },
              { label: 'Teams',    to: '/teams' },
              { label: 'Blog',     to: '/blog' },
              { label: 'Contact',  to: '/contact' },
              { label: 'FAQ',      to: '/faq' },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Policy links column */}
        <div>
          <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer bottom divider and copyright tag */}
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} PayStream, Inc. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

