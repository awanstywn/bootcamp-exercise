// src/components/article/ArticleForm.tsx
// Dual-purpose form for creating and editing articles.
// When `article` prop is provided, it pre-fills the form (edit mode).
// Validates input against shared Zod schemas before submitting.
// The `onSubmit` callback returns a boolean so the parent can close the modal on success.

import { useState } from 'react';
import { createArticleSchema, updateArticleSchema, type CreateArticleInput, type UpdateArticleInput } from '@blog-app/shared';
import type { Article } from '@blog-app/shared';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { Send, Save } from 'lucide-react';

interface ArticleFormProps {
  article?: Article | null;
  onSubmit: (data: CreateArticleInput | UpdateArticleInput) => Promise<boolean>;
  onCancel: () => void;
}

export default function ArticleForm({ article, onSubmit, onCancel }: ArticleFormProps) {
  const isEdit = !!article;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: article?.title || '',
    content: article?.content || '',
    imageUrl: article?.imageUrl || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (published: boolean) => {
    setErrors({});

    const payload = {
      ...form,
      published,
      imageUrl: form.imageUrl || undefined,
    };

    const schema = isEdit ? updateArticleSchema : createArticleSchema;
    const result = schema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const ok = await onSubmit(result.data);
    setLoading(false);
    if (ok) onCancel();
  };

  return (
    <div className="space-y-5">
      <Input
        label="Title"
        placeholder="An interesting title..."
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        error={errors.title}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-400">Content</label>
        <textarea
          className={`w-full min-h-[140px] rounded-lg border bg-black/20 px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-y ${
            errors.content ? 'border-red-500/50' : 'border-white/10'
          }`}
          placeholder="Write your thoughts here..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        {errors.content && <p className="text-xs text-red-400">{errors.content}</p>}
      </div>
      <ImageUpload
        label="Cover Image"
        value={form.imageUrl}
        onUploadSuccess={(url) => setForm({ ...form, imageUrl: url })}
        onClear={() => setForm({ ...form, imageUrl: '' })}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => handleSubmit(false)} 
          loading={loading}
        >
          <Save className="h-4 w-4" /> Save as Draft
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          onClick={() => handleSubmit(true)} 
          loading={loading}
        >
          <Send className="h-4 w-4" /> {isEdit ? 'Update Article' : 'Publish Now'}
        </Button>
      </div>
    </div>
  );
}
