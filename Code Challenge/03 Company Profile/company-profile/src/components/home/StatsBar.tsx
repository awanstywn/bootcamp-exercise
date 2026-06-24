/**
 * @file StatsBar.tsx
 * @description Showcases key company metrics (e.g., active users, volume) using animated counters.
 */

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from './animations';

export default function StatsBar() {
  const stats = [
    { label: 'Countries',         value: '195+' },
    { label: 'Currencies',        value: '135+' },
    { label: 'Annual volume',     value: '$840B' },
    { label: 'Uptime guarantee',  value: '99.99%' },
  ];

  return (
    <section className="bg-dark-100 py-16 border-b border-gray-200" aria-label="Company statistics">
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
      >
        {stats.map(stat => (
          <motion.div variants={fadeUp} key={stat.label}>
            <div className="text-4xl font-extrabold text-primary-500 mb-2">{stat.value}</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
