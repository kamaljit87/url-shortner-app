'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

function QrCodeContent({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: { dark: '#18181b', light: '#ffffff' },
    }).then((result) => {
      if (!cancelled) setDataUrl(result);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-4">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt={`QR code for ${url}`}
          className="h-64 w-64 rounded-lg border border-border"
        />
      ) : (
        <Skeleton className="h-64 w-64 rounded-lg" />
      )}
      <a href={dataUrl ?? undefined} download="short-url-qr-code.png" className="w-full">
        <Button variant="secondary" className="w-full" disabled={!dataUrl}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </a>
    </div>
  );
}

export function QrCodeDialog({
  open,
  onClose,
  url,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="QR code" description={url}>
      {open && <QrCodeContent key={url} url={url} />}
    </Dialog>
  );
}
