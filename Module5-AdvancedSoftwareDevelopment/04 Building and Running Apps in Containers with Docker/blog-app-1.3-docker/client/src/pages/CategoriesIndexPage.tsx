import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import SEOHead from '../components/SEOHead';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    posts: number;
  };
};

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/content/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const sortedCategories = [...categories].sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0));

  const displayedCategories = search.trim() 
    ? sortedCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : sortedCategories;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <SEOHead title="Explore Categories" />
      
      <div className="mb-12 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">
          Explore Categories
        </h1>
        <p className="text-slate-500 text-lg">
          Browse articles by category and discover topics that interest you.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12 relative">
        <input 
          type="text" 
          placeholder="Search categories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-lg outline-none focus:border-slate-900 transition-colors shadow-sm"
        />
        <svg className="w-6 h-6 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : displayedCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCategories.map((category) => (
            <Link 
              key={category.id} 
              to={`/categories/${category.slug}`}
              className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">{category.name}</h2>
                {category.description && (
                  <p className="text-slate-500 text-sm line-clamp-2">{category.description}</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">{category._count?.posts || 0} Articles</span>
                <span className="text-slate-900 font-medium group-hover:underline">Explore &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-12">
          <p>No categories found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
