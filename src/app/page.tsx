import { Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ArticleCard } from "@/components/ArticleCard";
import { RefreshButton } from "@/components/RefreshButton";
import { getArticles, getArticleCounts } from "@/lib/queries";
import { parseFilters } from "@/lib/filters";
import { availableModels } from "@/lib/ai";
import { getLastRefresh } from "@/lib/ingest";
import { timeAgo } from "@/lib/fmt";

export const dynamic = "force-dynamic";

export default async function Page(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const filters = parseFilters(sp as Record<string, string | string[] | undefined>);
  const [items, counts, lastRefresh] = await Promise.all([
    getArticles(filters),
    getArticleCounts(),
    getLastRefresh(),
  ]);
  const models = availableModels().map((m) => ({ id: m.id, label: m.label }));

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vibe<span className="text-[var(--accent)]">Crypto</span>
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Veille multi-sources · {counts.total} articles ({counts.withSummary} résumés)
            {lastRefresh ? ` · dernier refresh ${timeAgo(lastRefresh)}` : " · aucune donnée encore"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
        </div>
      </header>

      <Suspense fallback={null}>
        <FilterBar total={items.length} />
      </Suspense>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} models={models} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
      <h2 className="mb-2 text-lg font-semibold">Aucun article pour ces filtres</h2>
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
