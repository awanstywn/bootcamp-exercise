import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';
import ConfirmModal from '../components/ConfirmModal';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  createdAt: string;
  _count: {
    comments: number;
    likes: number;
  };
}

export default function ManagePostsPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/content/posts?authorId=${user.id}&status=ALL`)
        .then(res => setPosts(res.data.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user?.id]);

  const executeDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/content/posts/${postToDelete}`);
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <SEOHead title="Manage Posts" />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold font-serif m-0">Manage Posts</h1>
        </div>
        <Link to="/dashboard/posts/new" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-colors">
          Create New Post
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            You haven't written any posts yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="py-4 px-6 font-medium">Title</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Stats</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 line-clamp-1">{post.title}</p>
                    <Link to={`/posts/${post.slug}`} className="text-sm text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">View live</Link>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      post.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> {post.viewCount}</span>
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> {post._count?.likes || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right space-x-3">
                    <Link to={`/dashboard/posts/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm inline-block">Edit</Link>
                    <button onClick={() => setPostToDelete(post.id)} className="text-red-600 hover:text-red-900 font-medium text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
