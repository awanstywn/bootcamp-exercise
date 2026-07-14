import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import PostCard, { type PostCardProps } from '../components/PostCard';
import SEOHead from '../components/SEOHead';

type Post = PostCardProps['post'] & { id: string | number };

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formattedTagName = tag?.replace(/-/g, ' ').toUpperCase() || 'TAG';

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/content/posts?tag=${tag}&status=PUBLISHED`, { signal: controller.signal });
        setPosts(res.data.data);
      } // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (error: any) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        // eslint-disable-next-line no-console
console.error('Failed to fetch tag posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (tag) fetchPosts();

    return () => {
      controller.abort();
    };
  }, [tag]);

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <SEOHead title={`#${formattedTagName} Posts`} />
      
      <div className="mb-12 pb-8 border-b border-slate-200">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4 flex items-center gap-1"
        >
          &larr; Go Back
        </button>
        <h1 className="text-4xl font-bold font-serif text-slate-900">
          Tag: <span className="text-slate-500">#{formattedTagName}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} layout="horizontal" />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
              <p>No published articles found for this tag yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
