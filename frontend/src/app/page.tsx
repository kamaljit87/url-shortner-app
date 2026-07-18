import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-lg space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Shorten your links.
          <br />
          Track every click.
        </h1>
        <p className="text-base text-slate-500">
          Create short, memorable URLs with optional custom aliases, and see click counts,
          creation dates, and last-accessed times for every link you make.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
