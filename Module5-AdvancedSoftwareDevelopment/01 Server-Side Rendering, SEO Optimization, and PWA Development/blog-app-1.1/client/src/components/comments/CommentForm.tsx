import { useState, type FormEvent } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
}

export default function CommentForm({
  onSubmit,
  initialValue = '',
  placeholder = 'Write a comment...',
  submitLabel = 'Post',
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setError(null);
    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
        rows={3}
        placeholder={placeholder}
        aria-label={placeholder}
        required
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn-primary py-1.5 px-4 text-sm"
        >
          {isSubmitting ? 'Posting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
