/**
 * @file FeaturedServices.tsx
 * @description Fetches and displays the top featured services from Backendless API. Includes loading state and fallback logic.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchServices } from '@/lib/backendless';
import type { Service } from '@/types';

export default function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices().then(d => setServices(d.slice(0, 3))).catch(console.error);
  }, []);

  return (
    <section className="py-24 bg-dark-50 border-t border-gray-100" aria-labelledby="services-heading">
      <div className="container-custom text-center mb-16">
        <h2 id="services-heading" className="text-3xl sm:text-4xl font-extrabold text-dark-900 mb-4">Everything you need to grow</h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          A complete suite of APIs and tools to build and scale your business globally.
        </p>
      </div>
      
      <div className="container-custom grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.length === 0
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-pulse" aria-hidden="true">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-6" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            ))
          : services.map((service, i) => (
              <motion.article 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                key={service.objectId} 
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {service.thumbnail ? (
                  <img 
                    src={service.thumbnail} 
                    alt={service.title} 
                    loading="lazy"
                    className="w-full h-40 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-primary-500 font-bold text-xl" aria-hidden="true">
                      {service.title.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-dark-900 text-xl mb-3">{service.title}</h3>
                <p className="text-gray-500 text-base leading-relaxed line-clamp-3">{service.description}</p>
              </motion.article>
            ))}
      </div>
      
      <div className="text-center mt-12">
        <Link to="/services" className="btn-primary">View all products</Link>
      </div>
    </section>
  );
}
