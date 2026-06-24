/**
 * @file Layout.tsx
 * @description Master layout wrapper for the application. Injectable shell containing
 * the header navigation bar, page transition animators, the main dynamic workspace area, and the footer.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout component providing structural formatting (header, body, footer)
 * and animates page mounting/unmounting transitions.
 */
const Layout = () => {
  // Read current pathname to serve as a unique key for page routing transitions.
  const location = useLocation();

  return (
    // Flexbox structure ensures the footer is pushed to the bottom if content is thin (min-h-screen).
    <div className="min-h-screen flex flex-col">
      {/* Dynamic Navigation Header */}
      <Navbar />
      
      {/* AnimatePresence handles mounting and unmounting animations when child routes swap. */}
      {/* mode="wait" ensures the exit transition completes before the entry animation begins. */}
      <AnimatePresence mode="wait">
        <motion.main
          // Key changes prompt Framer Motion to animate whenever the URL changes.
          key={location.pathname}
          // Initial position: Invisible, shifted downwards slightly.
          initial={{ opacity: 0, y: 15 }}
          // Active state: Fully visible, at default height.
          animate={{ opacity: 1, y: 0 }}
          // Exit position: Fading out, floating upwards.
          exit={{ opacity: 0, y: -15 }}
          // Transition easing details
          transition={{ duration: 0.3, ease: 'easeOut' }}
          id="main-content"
          className="flex-grow flex flex-col"
        >
          {/* Outlet is the React Router hook that swaps out depending on the current active Route page. */}
          <Outlet />
        </motion.main>
      </AnimatePresence>
      
      {/* Static Company Footer */}
      <Footer />
    </div>
  );
};

export default Layout;

