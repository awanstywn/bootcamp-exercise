/**
 * @fileoverview Home Page Component
 * @objective Serve as the landing page, displaying the latest published articles and popular tags.
 * @risk High layout shift if loading states are not handled properly. Handled here via skeleton loaders (`animate-pulse`).
 * @relations Route: `/`. Uses `api.get` to fetch from `/content/posts` and `/content/tags`.
 * @logic
 * - `useEffect` triggers concurrent API calls for posts and tags on mount.
 * - Manages `isLoading` state to render skeleton placeholders before data arrives.
 * - Displays posts using the `PostCard` component.
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import PostCard, { type PostCardProps } from '../components/PostCard';
import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';

type Post = PostCardProps['post'] & { id: string | number };

interface Tag {
  id: string | number;
  slug: string;
  name: string;
}

interface Category {
  id: string | number;
  slug: string;
  name: string;
  _count?: { posts: number };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [meta, setMeta] = useState({ totalPages: 1, hasNextPage: false, hasPrevPage: false });

  // Fetch sidebar data once
  useEffect(() => {
    const controller = new AbortController();

    const fetchSidebarData = async () => {
      try {
        const [popularRes, tagsRes, categoriesRes] = await Promise.all([
          api.get('/content/posts?limit=4&status=PUBLISHED&sort=popular', { signal: controller.signal }),
          api.get('/content/tags', { signal: controller.signal }),
          api.get('/content/categories', { signal: controller.signal }),
        ]);
        setPopularPosts(popularRes.data.data);
        setTags(tagsRes.data);
        setCategories(categoriesRes.data);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        console.error('Failed to fetch sidebar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSidebarData();

    return () => controller.abort();
  }, []);

  // Fetch paginated posts
  useEffect(() => {
    const controller = new AbortController();
    setIsPostsLoading(true);

    const fetchPosts = async () => {
      try {
        const res = await api.get(`/content/posts?limit=6&status=PUBLISHED&page=${page}&sort=${sort}`, { signal: controller.signal });
        setPosts(res.data.data);
        setMeta(res.data.meta);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsPostsLoading(false);
      }
    };
    fetchPosts();

    return () => controller.abort();
  }, [page, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead title="Home" />

      <div className="flex flex-col md:flex-row items-center gap-12 mb-16 pb-16 border-b border-slate-200">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 leading-tight tracking-tight">
            Welcome to BlogApp
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            Read articles on technology, design, development and more from our amazing authors.
          </p>
          <div>
            <button 
              onClick={() => {
                setSort('newest');
                setPage(1);
                document.getElementById('latest-posts')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Explore Latest Posts
            </button>
          </div>
        </div>
        <div className="flex-1 w-full relative aspect-4/3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
          <img src={`${import.meta.env.BASE_URL}hero-image.png`} alt="Hero illustration" className="w-full h-full object-cover" fetchPriority="high" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div id="latest-posts" className="lg:col-span-8 pr-0 lg:pr-8 border-r-0 lg:border-r border-slate-200">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold font-serif text-slate-900">Posts</h2>
            <select
              aria-label="Sort posts"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1); // Reset to page 1 on sort change
              }}
              className="text-sm border border-slate-200 rounded px-3 py-1.5 outline-none focus:border-slate-900 bg-white"
            >
              <option value="newest">Date: Newest</option>
              <option value="oldest">Date: Oldest</option>
              <option value="title_asc">Title: A-Z (Ascending)</option>
              <option value="title_desc">Title: Z-A (Descending)</option>
            </select>
          </div>

          {isPostsLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse bg-slate-50 h-48 rounded-lg border border-slate-100" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} layout="horizontal" />
              ))}
              
              {/* Pagination UI */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!meta.hasPrevPage}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                    <button 
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${page === p ? 'bg-slate-900 text-white font-medium' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={!meta.hasNextPage}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
              No articles published yet.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10 pl-0 lg:pl-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 font-serif border-b border-slate-200 pb-2">Popular Posts</h3>
            <div className="space-y-6 mb-6">
              {popularPosts.map((post, index) => (
                <Link key={post.id} to={`/posts/${post.slug}`} className="flex gap-4 group cursor-pointer items-start">
                  <div className="text-3xl font-bold font-serif text-slate-200 group-hover:text-slate-300 transition-colors mt-1" aria-hidden="true">
                    0{index + 1}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {post.author?.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
                          {post.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-600">{post.author?.name || 'Unknown Author'}</span>
                    </div>
                    <h4 className="font-bold font-serif text-sm leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors">{post.title}</h4>
                    <span className="text-xs text-slate-500 mt-1">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &middot; 5 min read</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/popular" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">View all popular posts &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
