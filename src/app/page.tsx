import { ArticleFeed } from "@/components/ArticleFeed";
import { RefreshButton } from "@/components/RefreshButton";
import { getArticles, getArticleCounts } from "@/lib/queries";
import { getLastRefresh } from "@/lib/ingest";
import { timeAgo } from "@/lib/fmt";

export const dynamic = "force-dynamic";
export const preferredRegion = "cdg1";

export default async function Page() {
  const [items, counts, lastRefresh] = await Promise.all([
    getArticles({ limit: 300 }),
    getArticleCounts(),
    getLastRefresh(),
  ]);

  return (
    <main className="cv-fade-in mx-auto max-w-6xl flex-1 px-4 py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Vibe<span className="text-[var(--accent)]">Crypto</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Veille multi-sources
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1">
              {counts.total} articles
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1">
              {counts.withSummary} résumés
            </span>
            <span className="text-[var(--muted)]/80">
              {lastRefresh ? `dernier refresh ${timeAgo(lastRefresh)}` : "aucune donnée encore"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      <h2 className="mb-2 text-lg font-semibold">Aucun article pour le moment</h2>
      <p className="mx-auto max-w-md text-sm text-[var(--muted)]">
        Lance une première ingestion pour remplir la base :
      </p>
      <pre className="mx-auto mt-4 inline-block rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left text-xs">
        npm run refresh
      </pre>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Sans clé CryptoPanic, la source est ignorée. Configure tes clés IA dans
        <code className="mx-1">.env.local</code> pour activer les résumés.
      </p>
    </div>
  );
}
