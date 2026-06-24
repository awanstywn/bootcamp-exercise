/**
 * @file HeroSection.tsx
 * @description Renders the primary hero landing section. Utilizes framer-motion for entry animations.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 text-white py-24 lg:py-36">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary-500 blur-3xl opacity-20" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-blue-500 blur-3xl opacity-20" aria-hidden="true" />

      <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <div className="inline-block bg-primary-500/20 text-primary-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-500/30">
            🚀 Trusted by 10,000+ businesses globally
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            Financial infrastructure for the{' '}
            <span className="text-primary-300">internet</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
            Millions of companies — from startups to Fortune 500s — use PayStream to accept
            payments, send payouts, and manage their businesses online.
          </p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
            <Link to="/services" className="btn-primary flex items-center justify-center gap-2">
              Start now <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
              Contact sales
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:block relative h-[500px]"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500 absolute inset-0 w-full h-64 z-20">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <Zap className="text-white w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm">Revenue</div>
                  <div className="text-white font-bold text-xl">$124,500.00</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-white/20 rounded w-full overflow-hidden">
                  <div className="h-full bg-primary-400 w-3/4"></div>
                </div>
                <div className="h-2 bg-white/20 rounded w-5/6 overflow-hidden">
                  <div className="h-full bg-blue-400 w-1/2"></div>
                </div>
                <div className="h-2 bg-white/20 rounded w-4/6 overflow-hidden">
                  <div className="h-full bg-emerald-400 w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="bg-dark-800 border border-gray-700 rounded-2xl p-6 shadow-2xl transform rotate-[5deg] translate-y-32 translate-x-12 absolute inset-0 w-full h-64 z-10 opacity-80">
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
