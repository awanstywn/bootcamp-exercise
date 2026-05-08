// src/pages/DashboardPage.tsx
// Private page for authenticated users to manage their own articles.
// Logic:
//   - Filters the global articles list to only show articles belonging to the logged-in user.
//   - Provides "New Article" button which opens a modal with ArticleForm.
//   - Each article card has "Edit" and "Delete" buttons.
//   - "Edit" opens a modal with ArticleForm pre-filled with the selected article's data.
//   - "Delete" triggers a confirmation dialog and then calls the store's delete action.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Article, CreateArticleInput, UpdateArticleInput } from '@blog-app/shared';
import { useAuthStore } from '@/stores/auth.store';
import { useArticleStore } from '@/stores/article.store';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ArticleForm from '@/components/article/ArticleForm';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { articles, isLoading, fetchArticles, createArticle, updateArticle, deleteArticle } = useArticleStore();

  const [showCreate, setShowCreate] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);

  const myArticles = articles.filter((a) => a.authorId === user?.id);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCreate = async (data: CreateArticleInput | UpdateArticleInput) => {
    const ok = await createArticle(data as CreateArticleInput);
    if (ok) fetchArticles();
    return ok;
  };

  const handleUpdate = async (data: CreateArticleInput | UpdateArticleInput) => {
    if (!editArticle) return false;
    const ok = await updateArticle(editArticle.id, data as UpdateArticleInput);
    if (ok) fetchArticles();
    return ok;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const ok = await deleteArticle(id);
    if (ok) fetchArticles();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          My <span className="gradient-text">Articles</span>
        </h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Article
        </Button>
      </div>

      {/* Article List */}
      {isLoading ? (
        <Loader />
      ) : myArticles.length === 0 ? (
        <EmptyState
          title="You haven't written anything yet"
          description="Start sharing your ideas today."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create your first article
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          {myArticles.map((article) => (
            <div key={article.id} className="glass-card card-gradient-line relative flex flex-col p-6">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant={article.published ? 'published' : 'draft'} />
                <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
              </div>
              <Link to={`/articles/${article.id}`}>
                <h3 className="mb-2 text-lg font-semibold transition hover:text-violet-400">
                  {article.title}
                </h3>
              </Link>
              <p className="mb-4 grow text-sm text-gray-400 line-clamp-2">
                {article.content}
              </p>
              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditArticle(article)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(article.id)}>
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Article">
        <ArticleForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editArticle} onClose={() => setEditArticle(null)} title="Edit Article">
        <ArticleForm article={editArticle} onSubmit={handleUpdate} onCancel={() => setEditArticle(null)} />
      </Modal>
    </div>
  );
}
