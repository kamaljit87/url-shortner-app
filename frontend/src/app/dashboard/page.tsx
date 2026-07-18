'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { CreateUrlForm } from '@/components/CreateUrlForm';
import { UrlListItem } from '@/components/UrlListItem';
import { FormError } from '@/components/ui/FormError';
import { StatCards } from '@/components/dashboard/StatCards';
import { UrlToolbar, type SortOption } from '@/components/dashboard/UrlToolbar';
import { UrlListSkeleton } from '@/components/dashboard/UrlListSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';

function sortUrls(urls: ShortUrl[], sort: SortOption): ShortUrl[] {
  const sorted = [...urls];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'most-clicks':
      return sorted.sort((a, b) => b.clickCount - a.clickCount);
    case 'least-clicks':
      return sorted.sort((a, b) => a.clickCount - b.clickCount);
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export default function DashboardPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace('/login');
    }
  }, [isAuthLoading, token, router]);

  useEffect(() => {
    if (!token) return;

    urlApi
      .list(token)
      .then(setUrls)
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : 'Failed to load URLs.';
        setError(message);
        toast(message, 'error');
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredUrls = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = query
      ? urls.filter(
          (url) =>
            url.originalUrl.toLowerCase().includes(query) ||
            url.shortCode.toLowerCase().includes(query) ||
            url.customAlias?.toLowerCase().includes(query),
        )
      : urls;
    return sortUrls(matching, sort);
  }, [urls, search, sort]);

  if (isAuthLoading || !token) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and track your short links.
          </p>
        </div>
        <CreateUrlForm onCreated={(url) => setUrls((prev) => [url, ...prev])} />
      </div>

      <StatCards urls={urls} isLoading={isLoading} />

      <div className="space-y-4">
        <UrlToolbar search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />

        <FormError message={error} />

        {isLoading ? (
          <UrlListSkeleton />
        ) : urls.length === 0 ? (
          <EmptyState variant="no-urls" />
        ) : filteredUrls.length === 0 ? (
          <EmptyState variant="no-results" />
        ) : (
          <ul className="space-y-3">
            {filteredUrls.map((url) => (
              <li key={url.id}>
                <UrlListItem
                  url={url}
                  onUpdated={(updated) =>
                    setUrls((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
                  }
                  onDeleted={(id) => setUrls((prev) => prev.filter((u) => u.id !== id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
