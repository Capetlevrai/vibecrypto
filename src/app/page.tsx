import { ArticleFeed } from "@/components/ArticleFeed";
import { LastRefreshIndicator } from "@/components/LastRefreshIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { getArticles } from "@/lib/queries";
import { getLastRefresh } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const preferredRegion = "cdg1";

export default async function Page() {
  const [items, lastRefresh] = await Promise.all([
    getArticles({ limit: 300 }),
    getLastRefresh(),
  ]);

  return (
    <main className="cv-fade-in mx-auto w-full max-w-6xl flex-1 px-4 py-4">
      <header className="mb-3 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold leading-none tracking-tight sm:text-3xl">
          Vibe<span className="mark">Crypto</span>
        </h1>
        <div className="flex items-center gap-3">
          <LastRefreshIndicator initialLastRefresh={lastRefresh} />
          <RefreshButton />
        </div>
      </header>

      {items.length === 0 ? <EmptyState /> : <ArticleFeed articles={items} />}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
      <h2 className="mb-2 font-display text-lg font-semibold">Le fil est vide</h2>
      <p className="mx-auto max-w-md text-sm text-[var(--muted)]">
        Lance une première ingestion pour remplir la base :
      </p>
      <pre className="mx-auto mt-4 inline-block rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left font-mono text-xs">
        npm run refresh
      </pre>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Sans clé CryptoPanic, la source est ignorée. Configure tes clés IA dans
        <code className="mx-1 font-mono">.env.local</code> pour activer les résumés.
      </p>
    </div>
  );
}
