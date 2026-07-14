/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/axios';
import CommentItem, { CommentType } from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get(`/content/posts/${postId}/comments`);
      // Backend returns threaded comments directly (nested 'children')
      setComments(res.data);
    } // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (err: any) {
      // eslint-disable-next-line no-console
console.error('Failed to load comments', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true);
      fetchComments();
    }, 0);
  }, [fetchComments]);

  const handleCreateComment = async (content: string) => {
    try {
      await api.post(`/content/posts/${postId}/comments`, { content });
      await fetchComments(); // Refresh list
    } catch (error) {
      // eslint-disable-next-line no-console
console.error('Failed to create comment', error);
      throw error;
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await api.post(`/content/posts/${postId}/comments`, { content, parentId });
      await fetchComments(); // Refresh list
    } catch (error) {
      // eslint-disable-next-line no-console
console.error('Failed to reply', error);
      throw error;
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-2xl font-bold mb-6 text-slate-900">Comments</h3>

      <div className="mb-10">
        <CommentForm onSubmit={handleCreateComment} />
      </div>

      {error ? (
        <div className="text-center text-red-600 py-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : isLoading ? (
        <div className="text-center text-slate-500 py-4">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
