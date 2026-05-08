// src/pages/HomePage.tsx
// The landing page of the application.
// Logic:
//   - On mount, it triggers `fetchArticles` from the Article store to get all published articles.
//   - Displays a hero section with a "Premium Insights" call-to-action.
//   - Renders a loading spinner while fetching, an empty state if no articles exist,
//     or a grid list of articles using the ArticleList component.

import { useEffect, useState } from 'react';
import { useArticleStore } from '@/stores/article.store';
import ArticleList from '@/components/article/ArticleList';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import { Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import Input from '@/components/ui/Input';

export default function HomePage() {
  const { articles, isLoading, fetchArticles } = useArticleStore();
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(search || undefined, searchBy);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, searchBy, fetchArticles]);

  return (
    <>
      {/* Hero */}
      <section className="py-16 text-center animate-fade-in">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
          <Sparkles size={14} /> Premium Insights
        </div>
        <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Explore <span className="gradient-text">Premium Insights</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-gray-400">
          Discover ideas, thoughts, and technical deep-dives from our community of expert writers.
        </p>
      </section>

      {/* Search & Filter Section */}
      <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Search Articles
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Type keywords to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="w-full md:w-48 text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block ml-1">
              Filter By
            </label>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-colors appearance-none"
              >
                <option value="all" className="bg-dark text-white">All Fields</option>
                <option value="title" className="bg-dark text-white">Title Only</option>
                <option value="content" className="bg-dark text-white">Content Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      {isLoading ? (
        <Loader />
      ) : articles.length === 0 ? (
        <EmptyState
          title={search ? "No results found" : "No articles published yet"}
          description={search ? "Try adjusting your search keywords or filters." : "Be the first to share your thoughts!"}
        />
      ) : (
        <ArticleList articles={articles} />
      )}
    </>
  );
}
