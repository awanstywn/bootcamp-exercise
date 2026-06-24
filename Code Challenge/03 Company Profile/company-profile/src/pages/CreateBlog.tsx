/**
 * @file CreateBlog.tsx
 * @description Form page that allows logged-in team members to publish new blog articles.
 * Integrates react-hook-form for validation, an interactive markdown text editor, and
 * submits the committed document details directly to Backendless.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/useAuthStore';
import { createBlog, uploadImage } from '@/lib/backendless';
import MDEditor from '@uiw/react-md-editor';

// Form input key-value declarations
interface BlogForm {
  title: string;
  excerpt: string;
  tags: string;
}

/**
 * CreateBlog page component.
 */
const CreateBlog = () => {
  // Extract user details to stamp author information
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  
  // Local markdown body state hook (initializes with mock headers)
  const [content, setContent] = useState('## Start writing here...\n\n');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Initialize react-hook-form for handling simple input validation checks
  const { register, handleSubmit, formState: { errors } } = useForm<BlogForm>();

  /**
   * Action triggered upon form validation resolution.
   * Checks markdown body character length requirements and calls API.
   * @param data Validated BlogForm values
   */
  const onSubmit = async (data: BlogForm) => {
    // Validate that the markdown input satisfies the 20 character minimum constraint
    if (!content || content.trim().length < 20) {
      setError('Content must be at least 20 characters.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      let thumbnailUrl = undefined;
      if (imageFile) {
        thumbnailUrl = await uploadImage(imageFile);
      }
      
      // Submit blog record payload to database
      await createBlog({
        title:      data.title,
        content,
        excerpt:    data.excerpt,
        // Fallback names if user has no explicit display name
        authorName: user?.name ?? user?.email?.split('@')[0] ?? 'Anonymous',
        tags:       data.tags,
        featured:   user?.role === 'admin',
        thumbnail:  thumbnailUrl,
      });
      // Redirect back to main listings on success
      navigate('/blog');
    } catch {
      setError('Failed to publish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Write a Post — PayStream Blog</title>
      </Helmet>

      <div className="min-h-screen bg-dark-100 py-12">
        <div className="container-custom max-w-3xl">
          <h1 className="text-3xl font-bold text-dark-900 mb-1">Write a new post</h1>
          <p className="text-gray-400 text-sm mb-8">Share your knowledge with the PayStream community.</p>

          {/* Form error warning header */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          {/* Form setup noValidate allows us to use custom react-hook-form error notifications */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Title field */}
            <div>
              <label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="blog-title"
                type="text"
                placeholder="Your blog post title…"
                aria-required="true"
                aria-invalid={!!errors.title}
                className={`form-input ${errors.title ? 'border-red-400' : ''}`}
                {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'At least 5 characters' } })}
              />
              {errors.title && <p role="alert" className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Excerpt field */}
            <div>
              <label htmlFor="blog-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Short excerpt <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <textarea
                id="blog-excerpt"
                rows={2}
                placeholder="A one-sentence summary shown on the blog list…"
                aria-required="true"
                aria-invalid={!!errors.excerpt}
                className={`form-input resize-none ${errors.excerpt ? 'border-red-400' : ''}`}
                {...register('excerpt', { required: 'Excerpt is required' })}
              />
              {errors.excerpt && <p role="alert" className="text-red-500 text-xs mt-1">{errors.excerpt.message}</p>}
            </div>

            {/* Tags field */}
            <div>
              <label htmlFor="blog-tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="blog-tags"
                type="text"
                placeholder="payments, engineering, product"
                className="form-input"
                {...register('tags')}
              />
              <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
            </div>

            {/* Thumbnail Upload field */}
            <div>
              <label htmlFor="blog-thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                id="blog-thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Upload a hero image for your post.</p>
            </div>

            {/* Interactive Markdown editor section (uiw react-md-editor component) */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2" id="content-label">
                Content <span aria-hidden="true" className="text-red-500">*</span>
              </p>
              <div data-color-mode="light" aria-labelledby="content-label">
                <MDEditor
                  value={content}
                  onChange={val => setContent(val ?? '')}
                  height={420}
                  preview="live"
                />
              </div>
            </div>

            {/* Submission triggers */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing…' : 'Publish Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateBlog;

