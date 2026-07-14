/**
 * @fileoverview Post Detail Page Component
 * @objective Display a full blog post, its metadata, related posts, tags, and comments.
 * @risk Rendering unescaped HTML from the post content can lead to XSS attacks (currently using a simple split/map, but warns to use react-markdown).
 * @relations Route: `/posts/:slug`. Fetches data via `api.get('/content/posts/:slug')`. Renders `<CommentList />`.
 * @logic
 * - Reads `slug` from URL params.
 * - Fetches post details, tags, and related posts concurrently.
 * - If the user is authenticated, it checks if they have liked the post.
 * - `handleLike`: Toggles the like status optimistically and updates the server.
 * - Dynamically updates `<SEOHead>` with the post's specific metadata and image.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import SEOHead from '../components/SEOHead';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import CommentList from '../components/comments/CommentList';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  createdAt: string;
  viewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  author?: { name?: string; avatarUrl?: string; bio?: string };
  category?: { name: string; slug: string };
  tags?: { id: string; name: string; slug: string }[];
  _count: { likes: number; comments: number };
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  coverImageUrl?: string;
  createdAt: string;
}

interface Tag {
  id: string;
  slug: string;
  name: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  _count?: { posts: number };
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const controller = new AbortController();

    const fetchPost = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        const { data } = await api.get(`/content/posts/${slug}`, { signal: controller.signal });
        setPost(data);

        // Fetch popular posts and tags concurrently
        const [relRes, tagsRes, catRes] = await Promise.all([
          api.get('/content/posts?limit=4&sort=popular', { signal: controller.signal }),
          api.get('/content/tags', { signal: controller.signal }),
          api.get('/content/categories', { signal: controller.signal })
        ]);
        
        // Filter out current post
        setRelated(
          relRes.data.data.filter((p: RelatedPost) => p.id !== data.id).slice(0, 3)
        );
        setTags(tagsRes.data);
        setCategories(catRes.data);

        if (isAuthenticated) {
          const likeRes = await api.get(`/content/posts/${data.id}/likes/status`, { signal: controller.signal });
          setHasLiked(likeRes.data.liked);
        }
      } catch (error: unknown) {
        if ((error as Error).name === 'CanceledError' || (error as Error).name === 'AbortError') return;
        // eslint-disable-next-line no-console
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();

    return () => {
      controller.abort();
    };
  }, [slug, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) return alert('Please login to like');
    if (!post) return;
    try {
      const res = await api.post(`/content/posts/${post.id}/likes`);
      setHasLiked(res.data.liked);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              _count: { ...prev._count, likes: Math.max(0, prev._count.likes + (res.data.liked ? 1 : -1)) },
            }
          : null
      );
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error liking post:', e);
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-6 py-12 text-center">Loading...</div>;
  if (!post)
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center text-red-500">Post not found</div>
    );

  const authorName = post.author?.name || 'Unknown Author';
  
  const textForReadingTime = post.content || post.excerpt || '';
  const wordCount = textForReadingTime.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  const authorProfileLink = `/authors/${authorName.replace(/\s+/g, '-')}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        image={post.coverImageUrl}
        type="article"
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 pb-4 border-b border-slate-200">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>&rsaquo;</span>
        <Link to="/categories" className="hover:text-slate-900 transition-colors">Categories</Link>
        <span>&rsaquo;</span>
        <span className="hover:text-slate-900 transition-colors cursor-pointer">{post.category?.name || 'General'}</span>
        <span>&rsaquo;</span>
        <span className="text-slate-900 font-medium truncate max-w-[200px] md:max-w-xs">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
        {/* Main Content Area */}
        <article className="min-w-0">
          <div className="mb-8">
            <span className="inline-block bg-slate-100 text-slate-600 uppercase tracking-widest text-[10px] font-bold px-3 py-1 rounded mb-4">
              {post.category?.name?.toUpperCase() || 'GENERAL'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-serif text-slate-900 leading-tight">
              {post.title}
            </h1>
          </div>

          {/* Meta Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-sm text-slate-500 border-b border-slate-200 pb-6">
            <div className="flex items-center flex-wrap gap-3">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={authorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-slate-900 font-medium">{authorName}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>{post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : ''}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>{readingTime} min read</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {post.viewCount || 0} views
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${hasLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <svg className="w-4 h-4" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={hasLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {post._count?.likes || 0}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                {post._count?.comments || 0}
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="w-full aspect-21/9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden mb-12">
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            )}
          </div>

          {/* Content Body */}
          <div className="prose prose-lg prose-slate prose-headings:font-serif max-w-none prose-a:text-slate-900 mb-12 border-b border-slate-200 pb-12">
            {post.content ? (
              post.content.split('\n\n').map((paragraph: string, i: number) => {
                if (paragraph.startsWith('# ')) return <h1 key={i} className="text-3xl mt-8 mb-4 font-bold">{paragraph.replace('# ', '')}</h1>;
                if (paragraph.startsWith('## ')) return <h2 key={i} className="text-2xl mt-8 mb-4 font-bold">{paragraph.replace('## ', '')}</h2>;
                if (paragraph.startsWith('### ')) return <h3 key={i} className="text-xl mt-6 mb-3 font-bold">{paragraph.replace('### ', '')}</h3>;
                if (paragraph.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-6 bg-slate-50 py-3 pr-4 rounded-r">{paragraph.replace('> ', '')}</blockquote>;
                return <p key={i} className="mb-6 text-slate-700 leading-relaxed">{paragraph}</p>;
              })
            ) : (
              <p className="text-slate-500 italic">No content available.</p>
            )}
          </div>

          {/* Tags (Bottom) */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-3 mb-10">
              <span className="text-sm font-medium text-slate-700">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link key={tag.id} to={`/tags/${tag.slug}`} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-16">
            <div className="flex flex-col sm:flex-row gap-6">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={authorName} className="w-20 h-20 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">{authorName}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {post.author?.bio || 'This author has not provided a biography yet.'}
                </p>
                <div className="flex items-center justify-between">
                  <div></div>
                  <Link to={authorProfileLink} className="px-4 py-1.5 border border-slate-200 bg-white rounded text-sm font-medium hover:bg-slate-50 transition-colors">
                    View all posts
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
            <h3 className="font-bold text-slate-900 font-serif text-lg">{post._count?.comments || 0} Comments</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              Sort by: <span className="font-medium cursor-pointer flex items-center gap-1">Newest <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span>
            </div>
          </div>
          
          <CommentList postId={post.id} />
        </article>

        {/* Right Sidebar */}
        <aside className="space-y-10 pl-0 lg:pl-4">
          
          {/* Categories */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2">Categories</h3>
            <ul className="space-y-3 text-sm text-slate-600 mb-4">
              {categories.map((cat) => (
                <li key={cat.id} className="flex justify-between items-center group">
                  <Link to={`/categories/${cat.slug}`} className="flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> 
                    {cat.name}
                  </Link>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-medium">
                    {cat._count?.posts || 0}
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/categories" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">View all categories &rarr;</Link>
          </div>

          {/* Popular Posts */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2">Popular Posts</h3>
            <div className="space-y-4 mb-4">
              {related.map((rel) => (
                <Link key={rel.id} to={`/posts/${rel.slug}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded shrink-0 flex items-center justify-center text-slate-300 overflow-hidden">
                    {rel.coverImageUrl ? (
                      <img src={rel.coverImageUrl} alt={rel.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold font-serif text-xs line-clamp-2 group-hover:text-slate-600 transition-colors">{rel.title}</h4>
                    <span className="text-[10px] text-slate-500 mt-1">{rel.createdAt ? format(new Date(rel.createdAt), 'MMM dd, yyyy') : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/popular" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">View all popular posts &rarr;</Link>
          </div>

          {/* Tags Widget */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.slice(0, 10).map((tag) => (
                  <Link key={tag.id} to={`/tags/${tag.slug}`} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors">
                    {tag.name}
                  </Link>
                ))
              ) : (
                <span className="text-slate-500 text-sm">No tags available.</span>
              )}
            </div>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
