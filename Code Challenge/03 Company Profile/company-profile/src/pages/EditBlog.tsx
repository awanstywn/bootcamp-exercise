/**
 * @file EditBlog.tsx
 * @description Form page that allows admin team members to edit existing blog articles.
 * Integrates react-hook-form for validation and an interactive markdown text editor.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchBlogById, updateBlog, uploadImage } from '@/lib/backendless';
import MDEditor from '@uiw/react-md-editor';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface BlogForm {
  title: string;
  excerpt: string;
  tags: string;
}

const EditBlog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BlogForm>();

  // Fetch the existing blog data to populate the form
  useEffect(() => {
    if (!id) return;
    fetchBlogById(id)
      .then((blog) => {
        setValue('title', blog.title);
        setValue('excerpt', blog.excerpt);
        setValue('tags', blog.tags || '');
        setContent(blog.content);
      })
      .catch(() => setError('Failed to load blog post.'))
      .finally(() => setFetching(false));
  }, [id, setValue]);

  const onSubmit = async (data: BlogForm) => {
    if (!content || content.trim().length < 20) {
      setError('Content must be at least 20 characters.');
      return;
    }
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let thumbnailUrl = undefined;
      if (imageFile) {
        thumbnailUrl = await uploadImage(imageFile);
      }
      
      await updateBlog(id, {
        title: data.title,
        content,
        excerpt: data.excerpt,
        tags: data.tags,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
      });
      navigate(`/blog/${id}`);
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="py-32"><LoadingSpinner /></div>;

  return (
    <>
      <Helmet>
        <title>Edit Post — PayStream Blog</title>
      </Helmet>

      <div className="min-h-screen bg-dark-100 py-12">
        <div className="container-custom max-w-3xl">
          <h1 className="text-3xl font-bold text-dark-900 mb-1">Edit post</h1>
          <p className="text-gray-400 text-sm mb-8">Update the content of your published article.</p>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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
              <p className="text-xs text-gray-400 mt-1">Upload a new hero image (leave blank to keep current image).</p>
            </div>

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

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/blog/${id}`)}
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

export default EditBlog;
