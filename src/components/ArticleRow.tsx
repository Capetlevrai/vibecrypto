"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { ASSET_LABELS, EXCHANGE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import type { Lang } from "@/components/ArticleFeed";
import { formatDayShort, formatHour, timeAgo } from "@/lib/fmt";

function shortAgo(ms: number | null | undefined) {
  return timeAgo(ms)
    .replace(/ secondes?$/, "s")
    .replace(/ minutes?$/, " min")
    .replace(/ heures?$/, "h")
    .replace(/ jours?$/, "j");
}

export function ArticleRow({ article, lang }: { article: Article; lang: Lang }) {
  const [imgError, setImgError] = useState(false);

  const sourceColor = SOURCE_COLORS[article.source];
  const sourceName = article.sourceName ?? SOURCE_LABELS[article.source];
  const fr = lang === "fr";
  const displayTitle = fr ? article.titleFr ?? article.title : article.title;
  const blurb = fr ? article.summary ?? article.excerpt : article.excerpt;
  const sourceHref = article.finalUrl ?? article.url;
  const hasTags = article.assets.length > 0 || article.exchanges.length > 0;

  return (
    <article className="group relative">
      <div className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 p-2 transition duration-150 hover:border-[var(--marker)]/40 hover:bg-[var(--surface)] sm:flex-row sm:gap-4 sm:p-2.5">
        <Link
          href={`/item/${article.id}`}
          className="relative block w-full shrink-0 self-start overflow-hidden rounded-md bg-[var(--background)] sm:w-52"
        >
          {article.imageUrl && !imgError ? (
            <img
              src={article.imageUrl}
              alt={displayTitle}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="block aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105 sm:aspect-auto sm:h-auto"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className="flex aspect-[16/9] w-full items-center justify-center font-mono text-sm font-bold uppercase opacity-40"
              style={{ color: sourceColor }}
            >
              {sourceName.slice(0, 2)}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <div className="flex min-w-0 flex-col gap-1.5 sm:max-w-[40rem]">
            <h3
              title={displayTitle}
              className="font-display text-[19px] font-semibold leading-snug tracking-tight sm:text-[21px]"
            >
              <Link
                href={`/item/${article.id}`}
                className="line-clamp-2 transition-colors hover:text-[var(--marker)]"
              >
                {displayTitle}
              </Link>
            </h3>
            {blurb && (
              <p className="line-clamp-2 max-w-full text-[12px] leading-relaxed text-[var(--foreground)]/65 sm:max-w-[95%] sm:text-[13px]">{blurb}</p>
            )}

            <div className="mt-0.5 flex items-center justify-between gap-3 text-[11px] text-[var(--muted)] sm:hidden">
              <span className="inline-flex min-w-0 items-center gap-1.5 font-mono">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-[var(--surface)]"
                  style={{ background: sourceColor }}
                />
                <span className="truncate text-[var(--foreground)]/75">{sourceName}</span>
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  suppressHydrationWarning
                  className="font-mono tabular-nums text-[var(--muted)]"
                  title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
                >
                  {formatDayShort(article.publishedAt)}
                </span>
                <a
                  href={sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono uppercase tracking-wide text-[var(--foreground)]/70 transition-colors hover:text-[var(--marker)]"
                >
                  Source ↗
                </a>
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 text-[11px] text-[var(--muted)] sm:flex sm:w-36 sm:flex-col sm:items-end sm:gap-2 sm:self-stretch sm:text-right">
            <span className="inline-flex min-w-0 items-center gap-1.5 font-mono">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-[var(--surface)]"
                style={{ background: sourceColor }}
              />
              <span className="truncate text-[var(--foreground)]/75">{sourceName}</span>
            </span>
            <span
              suppressHydrationWarning
              className="flex flex-col items-end font-mono leading-tight tabular-nums text-[var(--muted)]"
              title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
            >
              <span>{formatHour(article.publishedAt)}</span>
              <span className="text-[var(--muted)]/80">{shortAgo(article.publishedAt)}</span>
            </span>
            {hasTags && (
              <div className="flex flex-wrap items-center justify-end gap-1">
                {article.assets.map((a) => (
                  <span
                    key={a}
                    className="rounded border border-[var(--asset)]/25 bg-[var(--asset)]/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--asset)]"
                  >
                    {ASSET_LABELS[a as keyof typeof ASSET_LABELS] ?? a}
                  </span>
                ))}
                {article.exchanges.map((e) => (
                  <span
                    key={e}
                    className="rounded border border-[var(--exchange)]/25 bg-[var(--exchange)]/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--exchange)]"
                  >
                    {EXCHANGE_LABELS[e as keyof typeof EXCHANGE_LABELS] ?? e}
                  </span>
                ))}
              </div>
            )}
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-wide text-[var(--foreground)]/70 transition-colors hover:text-[var(--marker)] sm:mb-1 sm:mt-auto"
            >
              Source ↗
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
