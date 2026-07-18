import { Link2, MousePointerClick, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ShortUrl } from '@/lib/api';

interface StatCardsProps {
  urls: ShortUrl[];
  isLoading: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Link2;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function StatCards({ urls, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
  const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={Link2} label="Total links" value={totalLinks.toLocaleString()} />
      <StatCard icon={MousePointerClick} label="Total clicks" value={totalClicks.toLocaleString()} />
      <StatCard icon={TrendingUp} label="Avg. clicks / link" value={avgClicks.toLocaleString()} />
    </div>
  );
}
