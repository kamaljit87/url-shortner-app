'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { FormInput } from './FormInput';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';

function formatDate(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString();
}

export function UrlListItem({
  url,
  onUpdated,
  onDeleted,
}: {
  url: ShortUrl;
  onUpdated: (url: ShortUrl) => void;
  onDeleted: (id: string) => void;
}) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [customAlias, setCustomAlias] = useState(url.customAlias ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setIsSaving(true);

    try {
      const updated = await urlApi.update(token, url.id, originalUrl, customAlias);
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update short URL.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    if (!confirm('Delete this short URL? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await urlApi.remove(token, url.id);
      onDeleted(url.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete short URL.');
      setIsDeleting(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isEditing) {
    return (
      <li className="rounded-xl border border-slate-200 bg-white p-5">
        <form onSubmit={handleSave} className="space-y-4">
          <FormInput
            id={`edit-url-${url.id}`}
            type="url"
            label="Destination URL"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <FormInput
            id={`edit-alias-${url.id}`}
            type="text"
            label="Custom alias (optional)"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
          />
          <ErrorMessage message={error} />
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSaving}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-sm font-semibold text-slate-900 hover:underline"
          >
            {url.shortUrl}
          </a>
          <p className="truncate text-sm text-slate-500" title={url.originalUrl}>
            {url.originalUrl}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-400">
            <span>{url.clickCount} clicks</span>
            <span>Created {formatDate(url.createdAt)}</span>
            <span>Last accessed {formatDate(url.lastAccessed)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>
      <ErrorMessage message={error} />
    </li>
  );
}
