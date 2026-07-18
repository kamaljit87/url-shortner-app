'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { CreateUrlForm } from '@/components/CreateUrlForm';
import { UrlListItem } from '@/components/UrlListItem';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function DashboardPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load URLs.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isAuthLoading || !token) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Your short URLs</h1>
        <p className="mt-1 text-sm text-slate-500">Create, manage, and track your links.</p>
      </div>

      <CreateUrlForm onCreated={(url) => setUrls((prev) => [url, ...prev])} />

      <ErrorMessage message={error} />

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading your URLs…</p>
      ) : urls.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          You haven&apos;t created any short URLs yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {urls.map((url) => (
            <UrlListItem
              key={url.id}
              url={url}
              onUpdated={(updated) =>
                setUrls((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
              }
              onDeleted={(id) => setUrls((prev) => prev.filter((u) => u.id !== id))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
