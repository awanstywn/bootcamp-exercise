/**
 * @file BlogList.tsx
 * @description Main blog directory. Loads and renders blog post records from Backendless,
 * displaying cards with title, excerpt, dynamic tags, author details, formatted dates,
 * and support tabs for filtering by featured or community entries.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '@/lib/backendless';
import type { Blog } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { Bookmark, PlusCircle } from 'lucide-react';

// Strict type boundaries for local filtering tabs
type FilterType = 'all' | 'featured' | 'community';

/**
 * BlogList Page Component.
 */
const BlogList = () => {
  // Local page state management variables
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Extract authorization status to hide/show the "Write a post" link button
  const { isAuthenticated } = useAuthStore();

  // Load articles list from backend/fallback system when component mounts
  useEffect(() => {
    fetchBlogs()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter list matching the current filter state tab selections
  const filtered = blogs.filter(b => {
    if (filter === 'featured')  return b.featured === true; // Holds official news
    if (filter === 'community') return !b.featured;         // Holds third party user-generated posts
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Blog — PayStream</title>
        <meta name="description" content="Stories, insights, and ideas from the PayStream team and community." />
      </Helmet>

      {/* Hero Header */}
      <section className="bg-dark-900 text-white py-20 text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">PayStream Blog</h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Stories, insights, and ideas from our team and the developer community.
          </p>
          {/* Renders option to create posts only if user session is active */}
          {isAuthenticated && (
            <Link to="/blog/create" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              Write a post
            </Link>
          )}
        </div>
      </section>

      {/* Filters & Grid section */}
      <section className="py-20">
        <div className="container-custom">

          {/* Filter Tab List controls */}
          <div className="flex gap-2 mb-10 border-b border-gray-200 pb-4" role="tablist">
            {(['all', 'featured', 'community'] as FilterType[]).map(f => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-500 hover:text-primary-500 hover:bg-primary-50'
                }`}
              >
                {f === 'all' ? 'All Posts' : f === 'featured' ? 'Featured' : 'Community'}
              </button>
            ))}
          </div>

          {/* Loading Skeletal Frames */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse" aria-hidden="true">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty database state handler */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-500">No posts yet</h2>
              {isAuthenticated && (
                <Link to="/blog/create" className="mt-4 inline-block btn-primary text-sm">
                  Be the first to write
                </Link>
              )}
            </div>
          )}

          {/* Dynamic Article Grid list */}
          {!loading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(blog => {
                return (
                  <Link
                    key={blog.objectId}
                    to={`/blog/${blog.objectId}`}
                    className="block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {/* Thumbnail Image display */}
                    {blog.thumbnail ? (
                      <img
                        src={blog.thumbnail}
                        alt={`Cover image for ${blog.title}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width={400}
                        height={192}
                      />
                    ) : (
                      // Fallback typography card if no image exists
                      <div
                        className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden"
                        aria-hidden="true"
                      >
                        <span className="text-5xl font-bold text-primary-300 group-hover:scale-110 transition-transform duration-300">
                          {blog.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Meta description values */}
                    <div className="p-5">
                      {/* Badge indicator tagging author/importance */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          blog.featured
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {blog.featured ? 'Featured' : 'Community'}
                      </span>

                      <h2 className="font-bold text-dark-900 text-lg mt-2 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-gray-500 text-sm line-clamp-3">{blog.excerpt}</p>

                      {/* Author credentials & formatted creation times (via date-fns format) */}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{blog.authorName}</span>
                        <time>{blog.created ? format(new Date(blog.created), 'MMM d, yyyy') : 'Recently'}</time>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogList;

