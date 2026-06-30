"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { ASSET_LABELS, EXCHANGE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { formatHour, timeAgo } from "@/lib/fmt";

export function ArticleRow({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);

  const sourceColor = SOURCE_COLORS[article.source];
  const blurb = article.summary ?? article.excerpt;

  return (
    <article className="group relative flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-3 transition duration-150 hover:border-[var(--accent)]/40 hover:bg-[var(--surface)] sm:gap-4 sm:p-3.5">
      <Link
        href={`/item/${article.id}`}
        className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--background)] sm:w-28"
      >
        {article.imageUrl && !imgError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-sm font-bold uppercase opacity-40"
            style={{ color: sourceColor }}
          >
            {(article.sourceName ?? SOURCE_LABELS[article.source]).slice(0, 2)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-[var(--surface)]"
              style={{ background: sourceColor }}
            />
            <span className="truncate text-[var(--foreground)]/80">
              {article.sourceName ?? SOURCE_LABELS[article.source]}
            </span>
          </span>
          <span
            suppressHydrationWarning
            className="shrink-0 tabular-nums"
            title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
          >
            {formatHour(article.publishedAt)} · {timeAgo(article.publishedAt)}
          </span>
        </div>

        <h3 title={article.title} className="text-sm font-semibold leading-snug tracking-tight">
          <Link
            href={`/item/${article.id}`}
            className="line-clamp-2 transition-colors hover:text-[var(--accent)]"
          >
            {article.title}
          </Link>
        </h3>

        {blurb && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{blurb}</p>
        )}

        {(article.assets.length > 0 || article.exchanges.length > 0) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            {article.assets.map((a) => (
              <span
                key={a}
                className="rounded-full bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)] ring-1 ring-inset ring-[var(--accent)]/20"
              >
                {ASSET_LABELS[a as keyof typeof ASSET_LABELS] ?? a}
              </span>
            ))}
            {article.exchanges.map((e) => (
              <span
                key={e}
                className="rounded-full bg-[var(--accent-2)]/15 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent-2)] ring-1 ring-inset ring-[var(--accent-2)]/20"
              >
                {EXCHANGE_LABELS[e as keyof typeof EXCHANGE_LABELS] ?? e}
              </span>
            ))}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 text-[11px] font-medium text-[var(--accent-2)] transition-colors hover:underline"
            >
              Source ↗
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
