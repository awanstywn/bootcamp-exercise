// src/pages/NotFoundPage.tsx
// Simple 404 page for non-existent routes.
// Provides a friendly message and a button to return to the Home page.

import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <h1 className="mb-2 text-7xl font-bold gradient-text">404</h1>
      <p className="mb-8 text-xl text-gray-400">Page not found</p>
      <Link to="/">
        <Button variant="outline">
          <Home size={16} /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
