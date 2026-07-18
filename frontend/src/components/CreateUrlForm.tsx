'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { FormInput } from './FormInput';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';

export function CreateUrlForm({ onCreated }: { onCreated: (url: ShortUrl) => void }) {
  const { token } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const url = await urlApi.create(token, originalUrl, customAlias);
      onCreated(url);
      setOriginalUrl('');
      setCustomAlias('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create short URL.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-base font-semibold text-slate-900">Create a short URL</h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <FormInput
            id="originalUrl"
            type="url"
            label="Destination URL"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very/long/path"
          />
        </div>
        <div className="sm:w-52">
          <FormInput
            id="customAlias"
            type="text"
            label="Custom alias (optional)"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-link"
          />
        </div>
      </div>
      <ErrorMessage message={error} />
      <Button type="submit" isLoading={isSubmitting}>
        Create short URL
      </Button>
    </form>
  );
}
