// src/components/ui/Badge.tsx
// Status badge component — shows "published" (green) or "draft" (amber) status.
// Used in DashboardPage to visually indicate article publish state.

const styles = {
  published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

export default function Badge({ variant }: { variant: 'published' | 'draft' }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${styles[variant]}`}>
      {variant}
    </span>
  );
}
