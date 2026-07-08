import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from './CommentForm';

export interface CommentType {
  id: string;
  content: string;
  createdAt: string | Date;
  author?: {
    name?: string;
    avatarUrl?: string;
  };
  children?: CommentType[];
}

interface CommentItemProps {
  comment: CommentType;
  onReply: (parentId: string, content: string) => Promise<void>;
}

export default function CommentItem({ comment, onReply }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = async (content: string) => {
    await onReply(comment.id, content);
    setIsReplying(false);
  };

  return (
    <div className="flex gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden">
        {comment.author?.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author?.name || 'User avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
            {comment.author?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-slate-800">
              {comment.author?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-slate-500">
              {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
            </span>
          </div>
          <p className="text-slate-700 text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="mt-1 ml-2">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
            aria-expanded={isReplying}
            aria-controls={`reply-form-${comment.id}`}
          >
            {isReplying ? 'Cancel Reply' : 'Reply'}
          </button>
        </div>

        {isReplying && (
          <div id={`reply-form-${comment.id}`} className="mt-2 ml-4">
            <CommentForm
              onSubmit={handleReplySubmit}
              placeholder="Write a reply..."
              submitLabel="Reply"
            />
          </div>
        )}

        {/* Render Replies (children) */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-4 ml-6 space-y-4 border-l-2 border-slate-100 pl-4">
            {comment.children.map((child: CommentType) => (
              <CommentItem key={child.id} comment={child} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
