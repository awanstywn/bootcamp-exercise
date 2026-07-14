import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import PostCard, { type PostCardProps } from '../components/PostCard';
import SEOHead from '../components/SEOHead';

type Post = Omit<PostCardProps['post'], 'author'> & { 
  id: string | number;
  author?: PostCardProps['post']['author'] & { bio?: string };
};


export default function AuthorProfilePage() {
  const { authorName } = useParams<{ authorName: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [authorProfile, setAuthorProfile] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  const formattedName = authorName?.replace(/-/g, ' ') || 'Author';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postsRes, authorsRes] = await Promise.all([
          api.get(`/content/posts?authorName=${authorName}&status=PUBLISHED&sort=${sort}`),
          api.get('/content/authors')
        ]);
        setPosts(postsRes.data.data);
        const profile = authorsRes.data.find((a: {name: string}) => a.name.toLowerCase() === formattedName.toLowerCase());
        setAuthorProfile(profile);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch author data', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (authorName) fetchData();
  }, [authorName, formattedName, sort]);

  const authorData = authorProfile || { name: formattedName, bio: '', avatarUrl: undefined };
  const authorInitials = authorData.name?.charAt(0).toUpperCase() || 'A';
  const displayBio = authorData.bio || 'This author has not provided a biography yet.';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEOHead title={`${authorData.name} - Profile`} />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-2 text-sm text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>&rsaquo;</span>
        <Link to="/authors" className="hover:text-slate-900 transition-colors">Authors</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-900">{authorData.name}</span>
      </div>

      {/* Header Profile Section */}
      <div className="bg-slate-100/50 pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
          {/* Avatar */}
          {authorData.avatarUrl ? (
            <img src={authorData.avatarUrl} alt={authorData.name} className="w-40 h-40 rounded-full object-cover shrink-0 border-4 border-white shadow-sm" />
          ) : (
            <div className="w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-5xl font-bold shrink-0 border-4 border-white shadow-sm">
              {authorInitials}
            </div>
          )}
          
          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold font-serif text-slate-900 mb-2">{authorData.name}</h1>
            <p className="text-sm font-medium text-slate-700 mb-4 tracking-wide uppercase">Writer &middot; Developer &middot; Lifelong Learner</p>
            <p className="text-slate-600 max-w-xl mb-6 leading-relaxed text-sm md:text-base">
              {displayBio}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-col items-center md:items-end mt-6 md:mt-0">
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{authorProfile?._count?.posts || posts.length}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        
        {/* Posts Feed */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold font-serif text-slate-900">Posts</h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-slate-200 rounded px-3 py-1.5 outline-none focus:border-slate-900 bg-white"
            >
              <option value="newest">Date: Newest</option>
              <option value="oldest">Date: Oldest</option>
              <option value="title_asc">Title: A-Z (Ascending)</option>
              <option value="title_desc">Title: Z-A (Descending)</option>
            </select>
          </div>

          <div className="space-y-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" />
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} layout="horizontal" />
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                This author has not published any posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
