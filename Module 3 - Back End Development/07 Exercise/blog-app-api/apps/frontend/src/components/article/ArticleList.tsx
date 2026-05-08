// src/components/article/ArticleList.tsx
// Responsive grid layout of ArticleCard components. Adjusts from 1 to 3 columns
// based on viewport width using Tailwind's responsive grid utilities.

import type { Article } from '@blog-app/shared';
import ArticleCard from './ArticleCard';

export default function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
