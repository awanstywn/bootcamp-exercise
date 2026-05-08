// src/pages/ArticleDetailPage.tsx
// Page for viewing a single article in full detail.
// Logic:
//   - Extracts the article ID from the URL parameters.
//   - Fetches article details on mount and clears the current article state on unmount.
//   - Displays the article title, author information, publish date, and content.
//   - Includes a "back" button to return to the home page.

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useArticleStore } from '@/stores/article.store';
import Loader from '@/components/ui/Loader';
import { formatDate } from '@/lib/utils';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentArticle, isLoading, fetchArticle, clearCurrent } = useArticleStore();

  useEffect(() => {
    if (id) fetchArticle(id);
    return () => clearCurrent();
  }, [id, fetchArticle, clearCurrent]);

  if (isLoading) return <Loader size="lg" />;
  if (!currentArticle) return null;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to articles
      </Link>

      <header className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">{currentArticle.title}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <Link to={`/profile/${currentArticle.author.id}`} className="flex items-center gap-1.5 text-violet-400 transition hover:text-violet-300">
            <User size={14} /> {currentArticle.author.name}
          </Link>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> {formatDate(currentArticle.createdAt)}
          </span>
        </div>
      </header>

      {currentArticle.imageUrl && (
        <img
          src={currentArticle.imageUrl}
          alt={currentArticle.title}
          className="mb-8 w-full rounded-2xl border border-white/10 object-cover"
        />
      )}

      <article className="glass-card p-8 text-gray-300 leading-8 whitespace-pre-wrap text-base md:text-lg">
        {currentArticle.content}
      </article>
    </div>
  );
}
