/**
 * @fileoverview Search Page Component (Stub)
 * @objective Provide a UI for users to query the blog for specific terms.
 * @risk N/A - Currently a placeholder.
 * @relations Route: `/search`.
 * @logic
 * - Renders a static placeholder indicating pending search functionality implementation.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import { api } from '../lib/axios';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/content/posts?search=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to fetch search results.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead title={query ? `Search: ${query}` : 'Search'} />
      <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>
      
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Searching...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <svg
            className="w-12 h-12 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No results found</h2>
          <p className="text-slate-500">
            We couldn't find any articles matching "{query}". Try adjusting your search terms.
          </p>
        </div>
      )}
    </div>
  );
}
