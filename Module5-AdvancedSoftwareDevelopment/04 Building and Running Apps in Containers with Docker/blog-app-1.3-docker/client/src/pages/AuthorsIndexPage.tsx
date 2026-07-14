import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import SEOHead from '../components/SEOHead';

type Author = {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  _count: {
    posts: number;
  };
};

export default function AuthorsIndexPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await api.get('/content/authors');
        setAuthors(res.data);
      } catch (error) {
        console.error('Failed to fetch authors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <SEOHead title="Our Authors" />
      
      <div className="mb-16 pb-8 border-b border-slate-200 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-slate-900 mb-4">
          Our Authors
        </h1>
        <p className="text-slate-500 text-lg">
          Meet the brilliant minds sharing their knowledge on our platform.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-xl h-64 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : authors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author) => (
            <Link 
              key={author.id} 
              to={`/authors/${encodeURIComponent(author.name.replace(/ /g, '-').toLowerCase())}`}
              className="group bg-white border border-slate-200 rounded-xl p-8 hover:border-slate-400 hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              {author.avatarUrl ? (
                <img 
                  src={author.avatarUrl} 
                  alt={author.name} 
                  className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-slate-50 group-hover:ring-slate-100 transition-all">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <h2 className="text-xl font-bold text-slate-900 mb-2">{author.name}</h2>
              
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                {author.bio || 'This author has not provided a bio yet.'}
              </p>
              
              <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
                {author._count.posts} {author._count.posts === 1 ? 'Article' : 'Articles'}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-12">
          <p>No authors found.</p>
        </div>
      )}
    </div>
  );
}
