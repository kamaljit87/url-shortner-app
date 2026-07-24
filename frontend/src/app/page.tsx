'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Link2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: Link2,
    title: 'Custom short links',
    description: 'Turn long URLs into clean, branded links with an optional custom alias.',
  },
  {
    icon: BarChart3,
    title: 'Click analytics',
    description: 'Track click counts, creation dates, and last-accessed times for every link.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description: 'JWT authentication and hashed passwords keep your account and links safe.',
  },
  {
    icon: Zap,
    title: 'Instant redirects',
    description: 'Short links resolve immediately, with no interstitial pages or delays.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent)]"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            Simple, fast, reliable
          </span>
          <h1 className="animate-fade-in mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Shorten links.
            <br />
            <span className="text-primary">Track every click.</span>
          </h1>
          <p className="animate-fade-in mt-6 text-lg text-muted-foreground">
            Create short, memorable URLs with optional custom aliases, and see click counts,
            creation dates, and last-accessed times for every link you make.
          </p>
          <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
