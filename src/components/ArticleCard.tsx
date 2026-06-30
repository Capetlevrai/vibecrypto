"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/types";
import type { ModelDef } from "@/lib/ai";
import { ASSET_LABELS, EXCHANGE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { formatHour, timeAgo } from "@/lib/fmt";
import { cn } from "@/lib/cn";

export function ArticleCard({
  article,
  models,
}: {
  article: Article;
  models: Pick<ModelDef, "id" | "label">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  function summarize() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: article.id, model: model || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec du résumé");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  const sourceColor = SOURCE_COLORS[article.source];
  const hasSummary = Boolean(article.summary);

  return (
    <article className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 backdrop-blur transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface)]">
      {article.imageUrl && !imgError && (
        <div className="relative -mx-4 -mt-4 mb-1 h-32 overflow-hidden bg-[var(--background)]">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
        </div>
      )}
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: sourceColor }}
          />
          {article.sourceName ?? SOURCE_LABELS[article.source]}
        </span>
        <span
          suppressHydrationWarning
          title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
        >
          {formatHour(article.publishedAt)} · {timeAgo(article.publishedAt)}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug">
        <Link href={`/item/${article.id}`} className="hover:text-[var(--accent)]">
          {article.title}
        </Link>
      </h3>

      {article.hook && !showOriginal && (
        <p className="border-l-2 border-[var(--accent)]/60 pl-2 text-sm italic text-[var(--foreground)]/90">
          {article.hook}
        </p>
      )}

      {hasSummary && !showOriginal ? (
        <div className="space-y-2 text-sm text-[var(--foreground)]/80">
          {article.summary!.split(/\n\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        article.excerpt && (
          <p className={cn("text-sm text-[var(--muted)]", !showOriginal && "line-clamp-3")}>
            {article.excerpt}
          </p>
        )
      )}

      {hasSummary && article.excerpt && (
        <button
          onClick={() => setShowOriginal((v) => !v)}
          className="self-start text-[11px] font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {showOriginal ? "← Voir le résumé FR" : "Voir l'original →"}
        </button>
      )}

      {(article.assets.length > 0 || article.exchanges.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {article.assets.map((a) => (
            <span
              key={a}
              className="rounded-md bg-[var(--accent)]/15 px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]"
            >
              {ASSET_LABELS[a as keyof typeof ASSET_LABELS] ?? a}
            </span>
          ))}
          {article.exchanges.map((e) => (
            <span
              key={e}
              className="rounded-md bg-[var(--accent-2)]/15 px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent-2)]"
            >
              {EXCHANGE_LABELS[e as keyof typeof EXCHANGE_LABELS] ?? e}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[var(--accent-2)] hover:underline"
        >
          Source ↗
        </a>
        <span className="text-[var(--border)]">·</span>
        <div className="flex flex-1 items-center justify-end gap-1.5">
          {models.length > 0 ? (
            <>
              <select
                suppressHydrationWarning
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={pending}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 py-1 text-[11px] text-[var(--foreground)] disabled:opacity-50"
                title="Modèle d'IA"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <button
                onClick={summarize}
                disabled={pending}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-semibold transition disabled:opacity-50",
                  hasSummary
                    ? "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    : "bg-[var(--accent)] text-black hover:brightness-110",
                )}
              >
                {pending ? "…" : hasSummary ? "Re-résumer" : "Résumer"}
              </button>
            </>
          ) : (
            <span className="text-[11px] text-[var(--muted)]">
              Aucune clé IA configurée
            </span>
          )}
        </div>
      </div>

      {article.summaryModel && (
        <div className="text-[10px] text-[var(--muted)]" suppressHydrationWarning>
          Résumé via {article.summaryModel}
          {article.summaryAt ? ` · ${timeAgo(article.summaryAt)}` : ""}
        </div>
      )}
      {error && <div className="text-[11px] text-red-400">⚠ {error}</div>}
    </article>
  );
}
