'use client';

import { FormEvent, useState } from 'react';
import { Link2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { Dialog } from './ui/Dialog';
import { FormInput } from './ui/FormInput';
import { FormError } from './ui/FormError';
import { Button } from './ui/Button';

export function CreateUrlForm({ onCreated }: { onCreated: (url: ShortUrl) => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setOriginalUrl('');
    setCustomAlias('');
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const url = await urlApi.create(token, originalUrl, customAlias);
      onCreated(url);
      toast('Short URL created', 'success');
      reset();
      setOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create short URL.';
      setError(message);
      toast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New URL
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title="Create a short URL"
        description="Paste a long URL and optionally choose a custom alias."
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormError message={error} />
          <FormInput
            id="originalUrl"
            type="url"
            label="Destination URL"
            required
            autoFocus
            icon={<Link2 className="h-4 w-4" />}
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very/long/path"
          />
          <FormInput
            id="customAlias"
            type="text"
            label="Custom alias"
            icon={<Sparkles className="h-4 w-4" />}
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-link"
            hint="Optional — leave blank for a random short code"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create short URL
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
