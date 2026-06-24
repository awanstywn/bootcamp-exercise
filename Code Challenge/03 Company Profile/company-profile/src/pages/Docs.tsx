/**
 * @file Docs.tsx
 * @description Developer Documentation portal page. Provides functional grids linking
 * directly to the Quickstart guides, API specs, Libraries/SDKs, and Tutorials.
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Book, Code, Terminal, Zap, ArrowRight } from 'lucide-react';

/**
 * Developer Documentation hub page component.
 */
const Docs = () => {
  return (
    <>
      <Helmet>
        <title>Documentation — PayStream</title>
        <meta name="description" content="Explore PayStream's API documentation, SDKs, and developer guides." />
      </Helmet>

      {/* Hero Section Banner */}
      <section className="bg-dark-900 text-white py-20 lg:py-28 text-center border-b border-gray-800">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Developer Documentation
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Everything you need to build with PayStream. Explore our guides, API reference, and SDKs.
          </p>
        </div>
      </section>

      {/* Main Documentation Catalog Grid */}
      <section className="py-20 bg-dark-50 min-h-[50vh]">
        <div className="container-custom max-w-5xl grid sm:grid-cols-2 gap-8">
          
          {/* Card 1: Quickstart guidelines */}
          <a href="https://stripe.com/docs/development" target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">Quickstart</h2>
            <p className="text-gray-500 mb-6">Get up and running with PayStream in under 5 minutes. Learn the basics of authentication and making your first API request.</p>
            <div className="text-primary-500 font-semibold flex items-center gap-2">
              Start building <ArrowRight className="w-4 h-4" />
            </div>
          </a>

          {/* Card 2: Technical API Reference Specs */}
          <a href="https://stripe.com/docs/api" target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">API Reference</h2>
            <p className="text-gray-500 mb-6">Comprehensive details on all API endpoints, request/response objects, error codes, and pagination.</p>
            <div className="text-emerald-500 font-semibold flex items-center gap-2">
              Read the spec <ArrowRight className="w-4 h-4" />
            </div>
          </a>

          {/* Card 3: Libraries & language bindings */}
          <a href="https://stripe.com/docs/libraries" target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">Libraries & SDKs</h2>
            <p className="text-gray-500 mb-6">Official client libraries for Node.js, Python, Ruby, Go, Java, and client-side SDKs for React and iOS.</p>
            <div className="text-blue-500 font-semibold flex items-center gap-2">
              View libraries <ArrowRight className="w-4 h-4" />
            </div>
          </a>

          {/* Card 4: Extended Product Guides */}
          <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Book className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">Guides</h2>
            <p className="text-gray-500 mb-6">In-depth tutorials on handling webhooks, setting up subscriptions, and fighting fraud with Radar.</p>
            <div className="text-purple-500 font-semibold flex items-center gap-2">
              Browse guides <ArrowRight className="w-4 h-4" />
            </div>
          </a>

        </div>

        {/* Support call-out link */}
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-4">Can't find what you're looking for?</p>
          <Link to="/contact" className="btn-outline">Contact Support</Link>
        </div>
      </section>
    </>
  );
};

export default Docs;

