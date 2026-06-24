/**
 * @file LogoBar.tsx
 * @description Displays a ticker or static bar of partner/client logos.
 */

import { Layers, Cpu, Box, Globe } from 'lucide-react';

export default function LogoBar() {
  return (
    <section className="py-10 border-b border-gray-200 bg-white overflow-hidden">
      <div className="container-custom">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Powering the world's best teams</p>
        <div className="flex justify-center gap-8 sm:gap-16 flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-xl text-dark-900"><Layers className="w-6 h-6" /> StackTech</div>
          <div className="flex items-center gap-2 font-bold text-xl text-dark-900"><Cpu className="w-6 h-6" /> NovaCompute</div>
          <div className="flex items-center gap-2 font-bold text-xl text-dark-900"><Box className="w-6 h-6" /> BlockStream</div>
          <div className="flex items-center gap-2 font-bold text-xl text-dark-900"><Globe className="w-6 h-6" /> GlobalNet</div>
        </div>
      </div>
    </section>
  );
}
