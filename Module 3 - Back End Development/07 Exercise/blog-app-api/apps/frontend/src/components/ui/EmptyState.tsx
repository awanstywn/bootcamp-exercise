// src/components/ui/EmptyState.tsx
// Empty state placeholder — shown when a list has no data (e.g., no articles yet).
// Accepts an optional action button (e.g., "Create your first article").

import { ReactNode } from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <FileText className="mb-4 h-16 w-16 text-gray-600" />
      <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
      {description && <p className="mt-2 text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
