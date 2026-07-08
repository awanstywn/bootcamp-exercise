/**
 * @fileoverview Popular Posts Page Component
 * @objective Display the most popular posts across the blog.
 * @relations Route: `/popular`.
 */
import { useEffect, useState } from 'react';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';
import { api } from '../lib/axios';

export default function PopularPostsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/content/posts?sort=popular&status=PUBLISHED`);
        setResults(res.data.data);
      } catch (err: any) {
        console.error('Failed to fetch popular posts:', err);
        setError('Failed to fetch popular posts.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead title="Popular Posts" />
      <h1 className="text-4xl font-bold font-serif mb-2 text-slate-900">Popular Posts</h1>
      <p className="text-slate-500 text-lg mb-12">Trending articles and most-read stories from our community.</p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="animate-pulse bg-slate-100 h-80 rounded-xl" />
          ))}
        </div>
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
          <p className="text-slate-500">
            No popular posts available yet.
          </p>
        </div>
      )}
    </div>
  );
}
