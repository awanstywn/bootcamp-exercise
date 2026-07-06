/**
 * @fileoverview Create Post Page Component (Stub)
 * @objective Provide an interface for Authors/Editors to write and publish new blog posts.
 * @risk N/A - Currently a placeholder. Future implementations must handle secure image uploads and HTML sanitation.
 * @relations Route: `/dashboard/posts/new`. Protected by `<ProtectedRoute requireRole={['ADMIN', 'AUTHOR']}>`.
 * @logic
 * - Currently renders a static placeholder indicating pending editor integration (e.g. TipTap or Quill).
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { api } from '../lib/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    metaTitle: '',
    metaDescription: '',
    coverImageUrl: '',
    categoryId: '',
    tagsString: '', // We will convert this to an array on submit
  });

  useEffect(() => {
    api
      .get('/content/categories')
      .then((res) => setCategories(res.data))
      // eslint-disable-next-line no-console
      .catch(console.error);

    if (id) {
      // We don't have a direct /posts/:id endpoint for editing (only by slug for public),
      // but wait, we might have to fetch the posts list and filter, or just use the backend if it exists.
      // Wait, there's no `GET /content/posts/:id`, but we can get it via `GET /content/posts?authorId=...` or create a new endpoint.
      // Let's just fetch all posts and find it for now to save time, or use slug if we pass it in state.
      // Actually, `/content/posts` returns posts with their tags and categories.
      api
        .get(`/content/posts?status=ALL`)
        .then((res) => {
          const post = res.data.data.find((p: { id: string }) => p.id === id);
          if (post) {
            setFormData({
              title: post.title,
              content: post.content,
              excerpt: post.excerpt || '',
              status: post.status,
              metaTitle: post.metaTitle || '',
              metaDescription: post.metaDescription || '',
              coverImageUrl: post.coverImageUrl || '',
              categoryId: post.categoryId || '',
              tagsString: post.tags?.map((t: { name: string }) => t.name).join(', ') || '',
            });
          }
        })
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Title and Content are required');
      return;
    }
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tagsString
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await api.put(`/content/posts/${id}`, payload);
      navigate('/dashboard/posts');
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Failed to update post.');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead title="Edit Post" />

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
        >
          <svg
            className="w-5 h-5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </button>
        <h1 className="text-3xl font-bold m-0 font-serif">Edit Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* MAIN COLUMN */}
        <div className="flex-1 w-full space-y-6">
          {/* Cover Image */}
          <div className="w-full">
            {formData.coverImageUrl ? (
              <div className="relative group w-full aspect-21/9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4">
                <img
                  src={formData.coverImageUrl}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            ) : null}
            <input
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="Paste cover image URL here..."
              className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 text-sm"
            />
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 space-y-6 shadow-sm">
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-4xl font-extrabold font-serif outline-none text-slate-900 placeholder:text-slate-300"
              placeholder="Post Title..."
            />
            <textarea
              required
              rows={18}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full outline-none font-mono text-slate-700 text-sm md:text-base leading-relaxed placeholder:text-slate-300 resize-none"
              placeholder="Write your amazing post here... (Markdown supported)"
            ></textarea>
          </div>
        </div>

        {/* SETTINGS SIDEBAR */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Publish Settings
            </h3>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm"
                placeholder="react, javascript, tutorial"
              />
              <p className="text-xs text-slate-400 mt-1">Comma-separated</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm font-medium"
              >
                <option value="DRAFT">Save as Draft</option>
                <option value="PUBLISHED">Publish Now</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-md font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm text-sm"
              >
                {isSubmitting ? 'Saving...' : 'Update Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1 bg-white text-slate-700 border border-slate-300 px-4 py-3 rounded-md font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              SEO Details
            </h3>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Excerpt</label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm resize-none"
                placeholder="A short summary of your post..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm"
                placeholder="Leave blank to use post title"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full border border-slate-200 rounded px-3 py-2 outline-none focus:border-slate-900 bg-slate-50 text-sm resize-none"
                placeholder="Leave blank to use excerpt"
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showConfirm}
        title="Update Post"
        message={`Are you sure you want to save changes to "${formData.title || 'this post'}"?`}
        confirmText="Yes, Update"
        onConfirm={executeSubmit}
        onCancel={() => setShowConfirm(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}
