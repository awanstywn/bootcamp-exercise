import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import SEOHead from '../components/SEOHead';

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
};

export default function TagsIndexPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/content/tags');
        setTags(res.data);
      } catch (error) {
        // eslint-disable-next-line no-console
console.error('Failed to fetch tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Sort by popularity (post count) descending
  const sortedTags = [...tags].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));

  // Filter based on search query, and limit to 50 top tags if no search query
  const displayedTags = search.trim() 
    ? sortedTags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : sortedTags.slice(0, 50);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <SEOHead title="Explore Tags" />
      
      <div className="mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">
          Explore Tags
        </h1>
        <p className="text-slate-500 text-lg">
          Browse topics written by our authors. Find exactly what you're looking for.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12 relative">
        <input 
          type="text" 
          placeholder="Search tags..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg outline-none focus:border-slate-900 transition-colors shadow-sm"
        />
        <svg className="w-6 h-6 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-24 h-10 bg-slate-100 animate-pulse rounded-full" />
          ))}
        </div>
      ) : displayedTags.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {displayedTags.map((tag) => (
            <Link 
              key={tag.id} 
              to={`/tags/${tag.slug}`}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>#{tag.name}</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tag._count?.posts || 0}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-12">
          <p>No tags found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
