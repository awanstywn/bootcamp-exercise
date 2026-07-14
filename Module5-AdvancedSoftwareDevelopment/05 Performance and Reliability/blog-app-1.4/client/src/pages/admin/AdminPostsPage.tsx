/**
 * @fileoverview Admin Posts Management Page
 * @objective Allow administrators (and potentially editors) to view, edit, and update the status of all blog posts globally.
 * @risk Changing post status (e.g., from DRAFT to PUBLISHED) without review could expose unfinished content.
 * @relations Route: `/admin/posts`. Interacts with `api.get('/content/posts')` and `api.patch('/content/posts/:id')`.
 * @logic
 * - `fetchPosts`: Retrieves the latest posts regardless of author or status.
 * - `handleUpdateStatus`: Triggers a PATCH request to update the publication status (DRAFT/PUBLISHED/etc).
 * - Displays posts in a table format with quick actions for viewing and editing.
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/axios';
import ConfirmModal from '../../components/ConfirmModal';

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  author?: {
    name: string;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get('/content/posts?limit=10');
      setPosts(res.data.data);
    } catch (err) {
      // eslint-disable-next-line no-console
console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
     
    fetchPosts();
  }, [fetchPosts]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/content/posts/${id}`, { status });
      await fetchPosts();
    } catch (err) {
      // eslint-disable-next-line no-console
console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const executeDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/content/posts/${postToDelete}`);
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
    } catch (err) {
      // eslint-disable-next-line no-console
console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Link to="/dashboard/posts/new" className="btn-primary text-sm">
          Create New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Views</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading posts...
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td
                      className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate"
                      title={post.title}
                    >
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{post.author?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={post.status}
                        onChange={(e) => handleUpdateStatus(post.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border outline-none ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : post.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING_REVIEW">Pending</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{post.viewCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/posts/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline text-xs mr-3"
                      >
                        View
                      </Link>
                      <Link
                        to={`/dashboard/posts/edit/${post.id}`}
                        className="text-slate-500 hover:text-slate-800 text-xs mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setPostToDelete(post.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete Post"
        isDangerous={true}
        onConfirm={executeDelete}
        onCancel={() => setPostToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
