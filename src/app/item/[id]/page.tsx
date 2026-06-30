import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticle } from "@/lib/queries";
import { formatDateTime } from "@/lib/fmt";
import { SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const preferredRegion = "cdg1";

export default async function ItemPage(props: PageProps<"/item/[id]">) {
  const { id } = await props.params;
  const article = await getArticle(id);
  if (!article) notFound();

  return (
    <main className="cv-fade-in mx-auto max-w-3xl flex-1 px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--marker)]"
      >
        ← Retour au fil
      </Link>

      <ArticleCard article={article} lang="fr" />

      <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-5">
        <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Détails</h2>
        <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">Source</dt>
          <dd>{article.sourceName ?? SOURCE_LABELS[article.source]}</dd>
          <dt className="font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">Publication</dt>
          <dd className="tabular-nums">{formatDateTime(article.publishedAt)}</dd>
          <dt className="font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">Récupérée</dt>
          <dd className="tabular-nums">{formatDateTime(article.fetchedAt)}</dd>
          <dt className="font-mono text-[11px] uppercase tracking-wide text-[var(--muted)]">Lien direct</dt>
          <dd>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[var(--accent-2)] hover:underline"
            >
              {article.url}
            </a>
          </dd>
        </dl>
      </section>

      {article.rawContent && (
        <section className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-5">
          <h2 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Contenu source (brut)
          </h2>
          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]/70">
            {article.rawContent}
          </p>
        </section>
      )}
    </main>
  );
}
