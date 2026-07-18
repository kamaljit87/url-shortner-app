import { Link2, SearchX } from 'lucide-react';

export function EmptyState({ variant }: { variant: 'no-urls' | 'no-results' }) {
  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <SearchX className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No matching URLs</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search term or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Link2 className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">No short URLs yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first short link to start tracking clicks.
      </p>
    </div>
  );
}
