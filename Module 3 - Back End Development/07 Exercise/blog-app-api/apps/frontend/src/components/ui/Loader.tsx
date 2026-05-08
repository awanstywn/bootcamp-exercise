// src/components/ui/Loader.tsx
// Spinning loader component in three sizes. Displayed during async data fetches.

import { Loader2 } from 'lucide-react';

const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

export default function Loader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`animate-spin text-violet-500 ${sizeMap[size]}`} />
    </div>
  );
}
