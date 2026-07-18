'use client';

import { FormEvent, useState } from 'react';
import { Link2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { Dialog } from './ui/Dialog';
import { FormInput } from './ui/FormInput';
import { FormError } from './ui/FormError';
import { Button } from './ui/Button';

function EditUrlForm({
  url,
  onClose,
  onUpdated,
}: {
  url: ShortUrl;
  onClose: () => void;
  onUpdated: (url: ShortUrl) => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [customAlias, setCustomAlias] = useState(url.customAlias ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setIsSaving(true);

    try {
      const updated = await urlApi.update(token, url.id, originalUrl, customAlias);
      onUpdated(updated);
      toast('Short URL updated', 'success');
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update short URL.';
      setError(message);
      toast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      <FormError message={error} />
      <FormInput
        id={`edit-url-${url.id}`}
        type="url"
        label="Destination URL"
        required
        autoFocus
        icon={<Link2 className="h-4 w-4" />}
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
      />
      <FormInput
        id={`edit-alias-${url.id}`}
        type="text"
        label="Custom alias"
        icon={<Sparkles className="h-4 w-4" />}
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
        hint="Optional — leave blank to use the auto-generated code"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export function EditUrlDialog({
  url,
  open,
  onClose,
  onUpdated,
}: {
  url: ShortUrl;
  open: boolean;
  onClose: () => void;
  onUpdated: (url: ShortUrl) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Edit short URL">
      {open && <EditUrlForm key={url.id} url={url} onClose={onClose} onUpdated={onUpdated} />}
    </Dialog>
  );
}
