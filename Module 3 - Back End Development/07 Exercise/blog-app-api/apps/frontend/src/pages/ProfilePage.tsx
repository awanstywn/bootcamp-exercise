// src/pages/ProfilePage.tsx
// Public profile page for any user.
// Logic:
//   - Fetches the user's profile details and their published articles simultaneously using Promise.all.
//   - Displays user info (avatar/initials, name, bio, email, join date).
//   - Displays a list of articles authored by this user.
//   - Handles loading states and non-existent user cases.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Mail, Camera, Loader2 } from 'lucide-react';
import { userApi } from '@/api/user.api';
import { useAuthStore } from '@/stores/auth.store';
import type { User, Article } from '@blog-app/shared';
import ArticleList from '@/components/article/ArticleList';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ImageUpload from '@/components/ui/ImageUpload';
import Modal from '@/components/ui/Modal';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = currentUser?.id === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([userApi.getById(id), userApi.getArticles(id)])
      .then(([userRes, articlesRes]) => {
        setUser(userRes.data.user);
        setArticles(articlesRes.data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAvatarUpdate = async (url: string) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await userApi.update(id, { avatar: url });
      setUser(prev => prev ? { ...prev, avatar: url } : null);
      setShowAvatarModal(false);
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error('Failed to update avatar');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <EmptyState title="User not found" description="The user you are looking for does not exist." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Profile Header */}
      <div className="glass-card animate-fade-in flex flex-col items-center p-12 text-center md:flex-row md:items-start md:text-left">
        <div className="relative group mb-6 md:mb-0 md:mr-10">
          {user.avatar ? (
            <img 
              src={user.avatar.startsWith('/') ? `http://localhost:3000${user.avatar}` : user.avatar} 
              alt={user.name} 
              className="h-32 w-32 rounded-full border-2 border-violet-500/30 object-cover" 
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-pink-500 text-3xl font-bold text-white">
              {getInitials(user.name)}
            </div>
          )}
          
          {isOwner && (
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
          )}
        </div>
        <div>
          <h1 className="mb-1 text-3xl font-bold">{user.name}</h1>
          {user.bio && <p className="mb-3 max-w-md text-gray-400">{user.bio}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Published Articles */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold">Published Articles</h2>
          <span className="text-sm text-gray-500">{articles.length} posts</span>
        </div>

        {articles.length > 0 ? (
          <ArticleList articles={articles} />
        ) : (
          <EmptyState 
            title="No articles yet" 
            description={isOwner ? "You haven't published any articles yet." : `${user.name} hasn't published any articles yet.`} 
          />
        )}
      </div>

      {/* Avatar Update Modal */}
      {isOwner && (
        <Modal 
          isOpen={showAvatarModal} 
          onClose={() => !isUpdating && setShowAvatarModal(false)} 
          title="Update Profile Picture"
        >
          <div className="space-y-6">
            <p className="text-sm text-gray-400">Choose a new photo to represent yourself on Blog Apps.</p>
            <ImageUpload 
              value={user.avatar ?? undefined} 
              onUploadSuccess={handleAvatarUpdate} 
              onClear={() => handleAvatarUpdate('')}
            />
            {isUpdating && (
              <div className="flex items-center justify-center gap-2 text-sm text-violet-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating profile...
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
