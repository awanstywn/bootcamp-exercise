/**
 * @file CTABanner.tsx
 * @description Call to action banner encouraging visitors to create an account or get started.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from './animations';

export default function CTABanner() {
  return (
    <section className="py-24 bg-dark-900 relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
      
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
        className="container-custom text-center text-white relative z-10"
      >
        <motion.h2 variants={fadeUp} id="cta-heading" className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">Ready to start building?</motion.h2>
        <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Join millions of businesses using PayStream to power their online payments and financial infrastructure.
        </motion.p>
        <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="btn-primary py-3 px-8 text-lg hover:scale-105 transition-transform">
            Create an account
          </Link>
          <Link to="/contact" className="border-2 border-white/20 text-white py-3 px-8 rounded-lg hover:bg-white/10 transition-colors font-bold text-lg">
            Contact sales
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
