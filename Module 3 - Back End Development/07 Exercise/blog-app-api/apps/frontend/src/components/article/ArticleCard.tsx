// src/components/article/ArticleCard.tsx
// Article preview card — displays title, excerpt, author name, and publish date.
// Uses glass-card styling with a gradient top-border that appears on hover.
// The author name links to their profile page; the title links to the full article.

import { Link } from 'react-router-dom';
import type { Article } from '@blog-app/shared';
import { formatDate, truncate } from '@/lib/utils';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="glass-card card-gradient-line relative flex flex-col p-6 hover:-translate-y-1">
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <Link to={`/profile/${article.author.id}`} className="transition hover:text-violet-400">
          {article.author.name}
        </Link>
        <span>{formatDate(article.createdAt)}</span>
      </div>
      <Link to={`/articles/${article.id}`}>
        <h3 className="mb-2 text-lg font-semibold transition hover:text-violet-400">
          {article.title}
        </h3>
      </Link>
      <p className="mb-4 grow text-sm leading-relaxed text-gray-400 line-clamp-3">
        {truncate(article.content, 160)}
      </p>
      <Link
        to={`/articles/${article.id}`}
        className="mt-auto inline-block w-full rounded-lg border border-white/10 py-2 text-center text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
      >
        Read Full Article
      </Link>
    </article>
  );
}
