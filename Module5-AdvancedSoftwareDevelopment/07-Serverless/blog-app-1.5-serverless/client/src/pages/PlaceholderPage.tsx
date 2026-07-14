/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function PlaceholderPage() {
  const location = useLocation();
  const titleName = location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').toUpperCase() || 'PAGE';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-8">
      <SEOHead title={`${titleName} - Coming Soon`} />
      <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-6">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      </div>
      <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Coming Soon</h1>
      <p className="text-slate-500 max-w-md">
        The <span className="font-medium text-slate-900">{titleName}</span> page is currently under construction. Please check back later!
      </p>
    </div>
  );
}
