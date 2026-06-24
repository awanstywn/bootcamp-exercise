/**
 * @file TestimonialsSection.tsx
 * @description Fetches and displays customer testimonials from Backendless API.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchTestimonials } from '@/lib/backendless';
import type { Testimonial } from '@/types';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials().then(setTestimonials).catch(console.error);
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-white" aria-labelledby="testimonials-heading">
      <div className="container-custom text-center mb-16">
        <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-extrabold text-dark-900">Trusted by the world's best</h2>
      </div>
      <div className="container-custom grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.blockquote 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            key={t.objectId} 
            className="bg-dark-50 rounded-2xl p-8 border border-gray-100 shadow-sm relative"
          >
            <div className="absolute top-6 left-6 text-primary-200 text-5xl font-serif leading-none" aria-hidden="true">"</div>
            <p className="text-gray-700 text-lg italic leading-relaxed mb-8 relative z-10 pt-4">
              {t.quote}
            </p>
            <footer className="flex items-center gap-4">
              {t.authorPhoto ? (
                <img 
                  src={t.authorPhoto} 
                  alt={t.authorName} 
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                  {t.authorName.charAt(0)}
                </div>
              )}
              <cite className="not-italic">
                <p className="font-bold text-dark-900 text-sm">{t.authorName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t.authorRole}{t.authorCompany ? ` at ${t.authorCompany}` : ''}
                </p>
              </cite>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
