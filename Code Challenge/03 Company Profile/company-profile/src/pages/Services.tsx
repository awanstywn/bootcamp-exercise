/**
 * @file Services.tsx
 * @description Product offerings and services page. Dynamically renders service details
 * from the CMS/Fallback database, displaying them in a high-fidelity alternating grid layout
 * complete with product pricing, images, features, and inline customer reviews.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchServices } from '@/lib/backendless';
import type { Service } from '@/types';
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Services listing page component.
 */
const Services = () => {
  const { isAuthenticated } = useAuthStore();
  // Local states holding CMS service documents and loading statuses
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Load services catalog from the backend/fallback module when page is mounted
  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Services — PayStream</title>
        <meta name="description" content="Explore our modular API products designed to help you accept payments, send payouts, and grow globally." />
      </Helmet>

      {/* Hero Intro Header */}
      <section className="bg-dark-900 text-white py-20 lg:py-28 text-center border-b border-gray-800">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            A fully integrated suite of payments products
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            We bring together everything that's required to build websites and apps that accept payments and send payouts globally.
          </p>
        </div>
      </section>

      {/* Main Services catalog list grid */}
      <section className="py-20 bg-white">
        <div className="container-custom space-y-24">
          {/* Skeleton Loaders: shown while database fetch is pending */}
          {loading && (
            <div className="space-y-24" aria-busy="true">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-12 items-center animate-pulse">
                  <div className={`h-64 bg-gray-200 rounded-2xl ${i % 2 !== 0 ? 'md:order-2' : ''}`} aria-hidden="true" />
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="h-8 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Catalog content list (alternates row layout based on item index) */}
          {!loading && services.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={service.objectId} className="grid md:grid-cols-2 gap-12 items-center group">
                {/* Visual Side: alternates orders using Tailwind md:order classes */}
                <div className={`relative ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  {/* Decorative background shadow tilt card */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-transparent rounded-3xl transform -rotate-3 scale-105 opacity-50 group-hover:rotate-0 transition-transform duration-500" aria-hidden="true" />
                  
                  {/* Image container box */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 relative z-10 aspect-video overflow-hidden flex flex-col justify-center items-center text-center">
                    {service.thumbnail ? (
                      <>
                        <img src={service.thumbnail} alt={service.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {/* Overlay gradient mask */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent pointer-events-none" />
                        {/* Dynamic price badge */}
                        {service.price && (
                          <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-semibold py-1.5 px-4 rounded-full">
                            {service.price}
                          </div>
                        )}
                      </>
                    ) : (
                      // Fallback initials box if thumbnail is absent
                      <div className="p-8 flex flex-col items-center justify-center h-full w-full">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                          <span className="text-primary-500 font-bold text-3xl" aria-hidden="true">
                            {service.title.charAt(0)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-dark-900 mb-2">{service.title}</h3>
                        {service.price && (
                          <div className="mt-4 bg-dark-900 text-white text-sm font-semibold py-1 px-3 rounded-full">
                            {service.price}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Description Side: matches opposite order of visual side */}
                <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 text-primary-500">
                    <Zap className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark-900 mb-4">{service.title}</h2>
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Standardized trust flags */}
                  <ul className="space-y-4 mb-8" role="list">
                    {['Global coverage', 'Instant setup', '24/7 technical support'].map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-dark-900 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Navigation link to Docs specifications */}
                  <Link to="/docs" className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                    Explore docs <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  {/* Inline product customer review quotes */}
                  {service.testimonialQuote && (
                    <div className="mt-10 p-6 bg-dark-50 rounded-2xl border border-gray-100 relative">
                      <p className="text-sm italic text-gray-600 mb-4">
                        "{service.testimonialQuote}"
                      </p>
                      {service.testimonialAuthor && (
                        <p className="text-xs font-semibold text-dark-900">
                          — {service.testimonialAuthor}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-24 bg-dark-900 text-center">
        <div className="container-custom">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to build the future?</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
            Create an account instantly and start testing our APIs with a free sandbox environment.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary py-3 px-8 text-lg">
              Create account
            </Link>
          )}
        </div>
      </section>
    </>
  );
};

export default Services;

