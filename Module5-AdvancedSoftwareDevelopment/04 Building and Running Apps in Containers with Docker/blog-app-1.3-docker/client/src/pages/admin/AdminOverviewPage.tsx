import { useEffect, useState } from 'react';
import { api } from '../../lib/axios';
import { Link } from 'react-router-dom';

interface Analytics {
  users: number;
  posts: number;
  comments: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading overview...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Users</span>
          <span className="text-4xl font-bold font-serif text-slate-900">{stats?.users || 0}</span>
          <Link to="/admin/users" className="mt-4 text-sm text-primary-600 hover:underline">Manage Users →</Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Posts</span>
          <span className="text-4xl font-bold font-serif text-slate-900">{stats?.posts || 0}</span>
          <Link to="/admin/posts" className="mt-4 text-sm text-primary-600 hover:underline">Manage Posts →</Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Comments</span>
          <span className="text-4xl font-bold font-serif text-slate-900">{stats?.comments || 0}</span>
          <span className="mt-4 text-sm text-slate-400">Moderation coming soon</span>
        </div>
      </div>
      
      <div className="bg-primary-50 rounded-xl p-8 border border-primary-100">
        <h2 className="text-xl font-bold text-primary-900 mb-2">Welcome to the Admin Panel</h2>
        <p className="text-primary-700 max-w-2xl">
          Use the sidebar to navigate through the administrative features. You can manage user roles, approve role requests, and moderate all content across the platform.
        </p>
      </div>
    </div>
  );
}
