"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { ASSET_LABELS, EXCHANGE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { formatHour, timeAgo } from "@/lib/fmt";
import { cn } from "@/lib/cn";

export function ArticleCard({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const sourceColor = SOURCE_COLORS[article.source];
  const hasSummary = Boolean(article.summary);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:bg-[var(--surface)] hover:shadow-xl hover:shadow-black/40">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {article.imageUrl && !imgError && (
        <div className="relative h-36 overflow-hidden bg-[var(--background)]">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/10 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className="inline-block h-2 w-2 rounded-full ring-2 ring-[var(--surface)]"
              style={{ background: sourceColor }}
            />
            <span className="text-[var(--foreground)]/80">
              {article.sourceName ?? SOURCE_LABELS[article.source]}
            </span>
          </span>
          <span
            suppressHydrationWarning
            className="tabular-nums"
            title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
          >
            {formatHour(article.publishedAt)} · {timeAgo(article.publishedAt)}
          </span>
        </div>

        <h3
          title={article.title}
          className="min-h-[3.75rem] text-base font-semibold leading-snug tracking-tight"
        >
          <Link
            href={`/item/${article.id}`}
            className="line-clamp-3 transition-colors hover:text-[var(--accent)]"
          >
            {article.title}
          </Link>
        </h3>

        {article.hook && !showOriginal && (
          <p className="border-l-2 border-[var(--accent)]/60 pl-3 text-sm italic leading-relaxed text-[var(--foreground)]/90">
            {article.hook}
          </p>
        )}

        {hasSummary && !showOriginal ? (
          <div className="space-y-2 text-sm leading-relaxed text-[var(--foreground)]/75">
            {article.summary!.split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          article.excerpt && (
            <p className={cn("text-sm leading-relaxed text-[var(--muted)]", !showOriginal && "line-clamp-3")}>
              {article.excerpt}
            </p>
          )
        )}

        {hasSummary && article.excerpt && (
          <button
            onClick={() => setShowOriginal((v) => !v)}
            className="self-start text-[11px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            {showOriginal ? "← Voir le résumé FR" : "Voir l'original →"}
          </button>
        )}

        {(article.assets.length > 0 || article.exchanges.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {article.assets.map((a) => (
              <span
                key={a}
                className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/20"
              >
                {ASSET_LABELS[a as keyof typeof ASSET_LABELS] ?? a}
              </span>
            ))}
            {article.exchanges.map((e) => (
              <span
                key={e}
                className="rounded-full bg-[var(--accent-2)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--accent-2)] ring-1 ring-inset ring-[var(--accent-2)]/20"
              >
                {EXCHANGE_LABELS[e as keyof typeof EXCHANGE_LABELS] ?? e}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--border)]/60 pt-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[var(--accent-2)] transition-colors hover:underline"
          >
            Source ↗
          </a>
        </div>
      </div>
    </article>
  );
}
