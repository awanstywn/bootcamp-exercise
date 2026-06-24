/**
 * @file CompanyOverview.tsx
 * @description Provides a brief text/image overview of the company mission and value proposition.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from './animations';

export default function CompanyOverview() {
  const values = [
    { icon: <Shield className="w-7 h-7 text-primary-500" aria-hidden="true" />,  title: 'Secure',   desc: 'End-to-end encryption' },
    { icon: <Zap    className="w-7 h-7 text-primary-500" aria-hidden="true" />,  title: 'Fast',     desc: 'Sub-100ms payments' },
    { icon: <Globe  className="w-7 h-7 text-primary-500" aria-hidden="true" />,  title: 'Global',   desc: '195 countries' },
    { icon: <TrendingUp className="w-7 h-7 text-primary-500" aria-hidden="true" />, title: 'Scalable', desc: 'Infinite scale' },
  ];

  return (
    <section className="py-24" aria-labelledby="overview-heading">
      <div className="container-custom grid md:grid-cols-2 gap-16 items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.span variants={fadeUp} className="text-primary-500 font-bold text-sm uppercase tracking-wider">Our Story</motion.span>
          <motion.h2 variants={fadeUp} id="overview-heading" className="text-3xl sm:text-4xl font-extrabold text-dark-900 leading-tight mt-4">Built for the way the world pays</motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-500 mt-6 leading-relaxed">
            Founded in 2015, PayStream was born from a simple insight: accepting payments online
            should be as easy as sending an email. Today we power $840B in annual transactions.
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4" role="list">
            {[
              'PCI DSS Level 1 certified',
              'Real-time fraud detection with ML',
              '24/7 engineering support',
              'Instant payouts in 60+ countries',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp}>
            <Link to="/about" className="mt-10 inline-flex items-center gap-2 text-primary-500 font-bold hover:text-primary-600 transition-colors group">
              Read our full story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-3xl p-8 border border-primary-100 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-6">
            {values.map(card => (
              <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-bold text-dark-900 text-lg mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
