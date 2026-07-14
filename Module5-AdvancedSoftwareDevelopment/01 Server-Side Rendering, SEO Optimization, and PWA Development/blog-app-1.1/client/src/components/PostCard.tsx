/**
 * @fileoverview PostCard Component
 * @objective Render a summary of a blog post (thumbnail, title, excerpt, author) for listing pages.
 * @risk Missing fallbacks for missing cover images or author avatars can lead to broken UI layouts.
 * @relations Used in `HomePage.tsx`, `SearchPage.tsx`, and `AdminPostsPage.tsx`. Links to `PostDetailPage.tsx`.
 * @logic
 * - Receives a `post` object as a prop.
 * - Displays a placeholder if `coverImageUrl` is null.
 * - Formats the `createdAt` timestamp using `date-fns`.
 * - Provides a fallback initial for the author's avatar if an image URL is missing.
 */
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string;
    createdAt: string;
    category?: { name: string };
  };
  layout?: 'vertical' | 'horizontal';
}

export default function PostCard({ post, layout = 'vertical' }: PostCardProps) {
  // Calculate reading time based on content or excerpt
  const textForReadingTime = post.content || post.excerpt || '';
  const wordCount = textForReadingTime.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (layout === 'horizontal') {
    return (
      <div className="bg-white rounded-lg overflow-hidden group flex flex-col md:flex-row gap-6 pb-8 border-b border-slate-100 last:border-0 mb-8">
        <Link
          to={`/posts/${post.slug}`}
          className="block relative aspect-video md:aspect-4/3 md:w-1/3 overflow-hidden bg-slate-100 shrink-0 rounded-lg"
          tabIndex={-1}
          aria-hidden="true"
        >
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg
                className="w-12 h-12 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          )}
        </Link>

        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
            {post.category?.name && (
              <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded uppercase tracking-wider font-semibold text-[10px]">
                {post.category.name}
              </span>
            )}
          </div>

          <Link
            to={`/posts/${post.slug}`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
          >
            <h3 className="text-2xl font-bold font-serif mb-2 line-clamp-2 hover:text-slate-600 transition-colors">
              {post.title}
            </h3>
          </Link>

          <p className="text-slate-500 text-sm mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt || 'No excerpt available for this post.'}
          </p>

          <div className="flex items-center gap-3 mt-auto text-sm text-slate-500">
            <span>{post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : ''}</span>
            <span>&middot;</span>
            <span>{readingTime} min read</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
      <Link
        to={`/posts/${post.slug}`}
        className="block relative aspect-video overflow-hidden bg-slate-100 shrink-0"
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
          {post.category?.name && (
            <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
              {post.category.name}
            </span>
          )}
          {post.category?.name && <span>&middot;</span>}
          <span>{post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : ''}</span>
          <span>&middot;</span>
          <span>{readingTime} min read</span>
        </div>

        <Link
          to={`/posts/${post.slug}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 rounded"
        >
          <h3 className="text-xl font-bold font-serif mb-2 line-clamp-2 hover:text-slate-600 transition-colors">
            {post.title}
          </h3>
        </Link>

        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {post.excerpt || 'No excerpt available for this post.'}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50 text-xs font-medium text-slate-500">
          <span>Read more</span>
          <span>&rarr;</span>
        </div>
      </div>
    </div>
  );
}
