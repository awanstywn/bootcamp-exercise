/**
 * @file BlogDetail.tsx
 * @description Individual blog post view. Dynamic router reading query route parameter `id`,
 * resolving the target article document from Backendless/local fallbacks,
 * formatting post creation times, and compiling markdown content values.
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchBlogById, deleteBlog } from '@/lib/backendless';
import type { Blog } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import MDEditor from '@uiw/react-md-editor';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

/**
 * Blog detail page component.
 */
const BlogDetail = () => {
  // Extract URL route parameter 'id' (representing objectId)
  const { id } = useParams<{ id: string }>();
  
  // State handles for target blog post details, loading, and routing errors
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlog(id);
      navigate('/blog');
    } catch {
      alert('Failed to delete post.');
    }
  };

  // Fetch the target article upon mounting or parameter change
  useEffect(() => {
    if (!id) return;
    fetchBlogById(id)
      .then(setBlog)
      .catch(() => setError('Blog post not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Display centered loader while resource resolves
  if (loading) return <div className="py-32"><LoadingSpinner /></div>;
  
  // Display error notification card if fetch returns empty or throws exceptions
  if (error || !blog) {
    return (
      <div className="py-32 text-center container-custom">
        <h1 className="text-3xl font-bold text-dark-900 mb-4">Post Not Found</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      {/* Set dynamic tab browser title to article title for SEO crawlability */}
      <Helmet>
        <title>{blog.title} — PayStream Blog</title>
        <meta name="description" content={blog.excerpt} />
      </Helmet>

      <article className="py-16 sm:py-24 bg-white">
        <div className="container-custom max-w-3xl">
          
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>

          {/* Article Header block */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                blog.featured ? 'bg-primary-100 text-primary-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {blog.featured ? 'Featured' : 'Community'}
              </span>
              <time className="text-sm text-gray-400">
                {blog.created ? format(new Date(blog.created), 'MMMM d, yyyy') : 'Recently'}
              </time>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-900 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Admin Controls */}
            {user?.role === 'admin' && (
              <div className="flex gap-3 mb-6">
                <Link to={`/blog/edit/${blog.objectId}`} className="btn-outline inline-flex items-center gap-2 py-2 px-4 text-sm">
                  <Edit className="w-4 h-4" /> Edit Post
                </Link>
                <button onClick={handleDelete} className="btn-outline inline-flex items-center gap-2 py-2 px-4 text-sm text-red-600 hover:bg-red-50 hover:border-red-200">
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              </div>
            )}

            {/* Author Profile section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {blog.authorName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-medium text-dark-900 text-sm">{blog.authorName || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">Author</p>
              </div>
            </div>
          </header>

          {/* Thumbnail image display */}
          {blog.thumbnail && (
            <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={blog.thumbnail} alt={`Cover for ${blog.title}`} className="w-full object-cover max-h-[400px]" />
            </figure>
          )}

          {/* Markdown body content compiling (uiw markdown render wrapper component) */}
          <div className="prose prose-lg max-w-none prose-a:text-primary-500 prose-headings:text-dark-900 prose-img:rounded-xl" data-color-mode="light">
            <MDEditor.Markdown source={blog.content} />
          </div>

          {/* Tags list (split by comma and mapped dynamically) */}
          {blog.tags && (
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 font-medium mr-2 self-center">Tags:</span>
              {blog.tags.split(',').map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

        </div>
      </article>
      
      {/* Dynamic CTA Footer banner */}
      <section className="py-20 bg-dark-50 border-t border-gray-200 text-center">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-dark-900 mb-4">Start building with PayStream</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Join thousands of developers integrating the world's most powerful payments APIs.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary">Create an account</Link>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogDetail;

