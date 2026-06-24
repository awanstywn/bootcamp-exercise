/**
 * @file NotFound.tsx
 * @description Custom 404 Error page. Renders centered layout when users request
 * invalid endpoints, equipped with redirect triggers to support portals and the homepage.
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

/**
 * NotFound fallback page component.
 */
const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found — PayStream</title>
      </Helmet>

      {/* Screen centering flex wrapper */}
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center min-h-[70vh]">
        {/* Warning Icon wrapper */}
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 font-semibold mb-2">Page not found</p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        {/* Navigation options to resolve 404 block */}
        <div className="flex gap-4">
          <Link to="/" className="btn-primary">
            Go back home
          </Link>
          <Link to="/contact" className="btn-outline">
            Contact support
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;

