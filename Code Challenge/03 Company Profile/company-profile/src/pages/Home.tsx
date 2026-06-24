/**
 * @file Home.tsx
 * @description Homepage component of PayStream. Displays a Stripe-inspired landing page layout,
 * complete with a dynamic hero section, stats bar, company overview, featured product catalog grids,
 * customer quotes, and call-to-actions.
 */

import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/home/HeroSection';
import LogoBar from '@/components/home/LogoBar';
import StatsBar from '@/components/home/StatsBar';
import CompanyOverview from '@/components/home/CompanyOverview';
import FeaturedServices from '@/components/home/FeaturedServices';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTABanner from '@/components/home/CTABanner';

/**
 * Homepage Component.
 */
const Home = () => {
  return (
    <>
      {/* Dynamic document headers override for Search Engine Optimization (SEO) parameters */}
      <Helmet>
        <title>PayStream — Modern Payment Infrastructure</title>
        <meta name="description" content="PayStream provides fast, secure, and scalable payment solutions for businesses worldwide. Start today." />
        <meta property="og:title" content="PayStream — Modern Payment Infrastructure" />
        <meta property="og:description" content="Powering online commerce for thousands of businesses." />
      </Helmet>

      <HeroSection />
      <LogoBar />
      <StatsBar />
      <CompanyOverview />
      <FeaturedServices />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
};

export default Home;

