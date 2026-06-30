"use client";

import Link from "next/link";
import type { Article } from "@/lib/types";
import type { Lang } from "@/components/ArticleFeed";
import { ASSET_LABELS, EXCHANGE_LABELS, SOURCE_COLORS, SOURCE_LABELS } from "@/lib/types";
import { formatHour, timeAgo } from "@/lib/fmt";
import { useState } from "react";

function shortAgo(ms: number | null | undefined) {
  return timeAgo(ms)
    .replace(/ secondes?$/, "s")
    .replace(/ minutes?$/, " min")
    .replace(/ heures?$/, "h")
    .replace(/ jours?$/, "j");
}

export function ArticleCard({ article, lang }: { article: Article; lang: Lang }) {
  const [imgError, setImgError] = useState(false);

  const sourceColor = SOURCE_COLORS[article.source];
  const fr = lang === "fr";
  const displayTitle = fr ? article.titleFr ?? article.title : article.title;
  const paragraphs = fr && article.summary ? article.summary.split(/\n\n+/) : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--marker)]/40 hover:bg-[var(--surface)]">
      <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-[var(--marker)] transition-transform duration-200 group-hover:scale-x-100" />

      {article.imageUrl && !imgError && (
        <div className="relative h-36 overflow-hidden bg-[var(--background)]">
          <img
            src={article.imageUrl}
            alt={displayTitle}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/10 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full ring-2 ring-[var(--surface)]" style={{ background: sourceColor }} />
            <span className="text-[var(--foreground)]/75">{article.sourceName ?? SOURCE_LABELS[article.source]}</span>
          </span>
          <span
            suppressHydrationWarning
            className="tabular-nums"
            title={article.publishedAt ? new Date(article.publishedAt).toLocaleString("fr-FR") : ""}
          >
            {formatHour(article.publishedAt)} · {shortAgo(article.publishedAt)}
          </span>
        </div>

        <h3 title={displayTitle} className="min-h-[4.5rem] font-display text-xl font-semibold leading-snug tracking-tight">
          <Link href={`/item/${article.id}`} className="line-clamp-3 transition-colors hover:text-[var(--marker)]">
            {displayTitle}
          </Link>
        </h3>

        {fr && article.hook && (
          <p className="border-l-2 border-[var(--marker)]/50 pl-3 text-sm italic leading-relaxed text-[var(--foreground)]/90">
            {article.hook}
          </p>
        )}

        {paragraphs ? (
          <div className="space-y-2 text-[15px] leading-relaxed text-[var(--foreground)]/75">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          article.excerpt && <p className="line-clamp-3 text-[15px] leading-relaxed text-[var(--foreground)]/65">{article.excerpt}</p>
        )}

        {(article.assets.length > 0 || article.exchanges.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {article.assets.map((a) => (
              <span
                key={a}
                className="rounded border border-[var(--asset)]/25 bg-[var(--asset)]/10 px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--asset)]"
              >
                {ASSET_LABELS[a as keyof typeof ASSET_LABELS] ?? a}
              </span>
            ))}
            {article.exchanges.map((e) => (
              <span
                key={e}
                className="rounded border border-[var(--exchange)]/25 bg-[var(--exchange)]/10 px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--exchange)]"
              >
                {EXCHANGE_LABELS[e as keyof typeof EXCHANGE_LABELS] ?? e}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)]/60 pt-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] uppercase tracking-wide text-[var(--foreground)]/70 transition-colors hover:text-[var(--marker)]"
          >
            Source ↗
          </a>
        </div>
      </div>
    </article>
  );
}
