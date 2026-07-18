'use client';

import { useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  MousePointerClick,
  Pencil,
  QrCode,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, ShortUrl, urlApi } from '@/lib/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { EditUrlDialog } from './EditUrlDialog';
import { QrCodeDialog } from './QrCodeDialog';

function formatDate(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDelete() {
    if (!token) return;
    try {
      await urlApi.remove(token, url.id);
      onDeleted(url.id);
      toast('Short URL deleted', 'success');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to delete short URL.', 'error');
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    toast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Card className="animate-fade-in p-4 transition-colors hover:border-border-hover sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <span className="truncate">{url.shortUrl}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </div>
            <p className="truncate text-sm text-muted-foreground" title={url.originalUrl}>
              {url.originalUrl}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                {url.clickCount.toLocaleString()} clicks
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created {formatDate(url.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Last click {formatDate(url.lastAccessed)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy short URL"
              title="Copy short URL"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsQrOpen(true)}
              aria-label="Show QR code"
              title="Show QR code"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsEditOpen(true)}
              aria-label="Edit short URL"
              title="Edit short URL"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsDeleteOpen(true)}
              aria-label="Delete short URL"
              title="Delete short URL"
              className="hover:border-danger-border hover:bg-danger-bg hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <EditUrlDialog
        url={url}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={onUpdated}
      />

      <QrCodeDialog open={isQrOpen} onClose={() => setIsQrOpen(false)} url={url.shortUrl} />

      <ConfirmDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this short URL?"
        description="This will permanently remove the link and its analytics. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
