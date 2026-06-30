import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { articles, meta } from "./db/schema";
import { ADAPTERS } from "./sources";
import { tagText } from "./tagging";
import { summarizePending, type BatchSummaryResult } from "./summarize-batch";
import { perSourceMax } from "./config";
import { logEvent } from "./logs";
import type { RawArticle } from "./sources";

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    let p = u.pathname.replace(/\/+$/, "");
    if (p === "") p = "/";
    return `${u.host.toLowerCase()}${p}`;
  } catch {
    return raw.trim().toLowerCase().replace(/\/+$/, "");
  }
}

export function urlHash(raw: string): string {
  return createHash("sha1").update(normalizeUrl(raw)).digest("hex").slice(0, 24);
}

export function articleId(raw: string): string {
  return createHash("sha1").update(normalizeUrl(raw)).digest("hex").slice(0, 16);
}

export interface IngestResult {
  total: number;
  inserted: number;
  perSource: Record<string, { fetched: number; inserted: number; error?: string }>;
  summary: BatchSummaryResult;
}

export async function runIngest(opts: { only?: string[] } = {}): Promise<IngestResult> {
  const now = Date.now();
  const adapters = opts.only
    ? ADAPTERS.filter((a) => opts.only!.includes(a.source))
    : ADAPTERS;

  const settled = await Promise.allSettled(adapters.map((a) => a.fetch()));

  const perSource: IngestResult["perSource"] = {};
  let total = 0;
  let inserted = 0;
  const toInsert: (typeof articles.$inferInsert)[] = [];
  const heliusImageUpdates: { urlHash: string; imageUrl: string }[] = [];

  adapters.forEach((adapter, i) => {
    const res = settled[i];
    if (res.status !== "fulfilled") {
      perSource[adapter.source] = {
        fetched: 0,
        inserted: 0,
        error: res.reason instanceof Error ? res.reason.message : String(res.reason),
      };
      return;
    }
    const cap = perSourceMax();
    const list: RawArticle[] = cap > 0 ? res.value.slice(0, cap) : res.value;
    perSource[adapter.source] = { fetched: list.length, inserted: 0 };
    for (const r of list) {
      const { assets, exchanges } = tagText(r.title, r.excerpt, r.rawContent);
      const hash = urlHash(r.url);
      if (r.source === "helius" && r.imageUrl) {
        heliusImageUpdates.push({ urlHash: hash, imageUrl: r.imageUrl.slice(0, 1000) });
      }
      toInsert.push({
        id: articleId(r.url),
        title: r.title.slice(0, 400),
        excerpt: r.excerpt?.slice(0, 800) ?? null,
        hook: null,
        summary: null,
        summaryModel: null,
        summaryAt: null,
        url: r.url,
        imageUrl: r.imageUrl?.slice(0, 1000) ?? null,
        urlHash: hash,
        source: r.source,
        sourceName: r.sourceName ?? null,
        publishedAt: r.publishedAt && !Number.isNaN(r.publishedAt) ? r.publishedAt : null,
        fetchedAt: now,
        assets,
        exchanges,
        rawContent: r.rawContent?.slice(0, 16000) ?? null,
        score: assets.length * 2 + exchanges.length,
      });
      total += 1;
    }
  });

  // Insertion idempotente (ignore les doublons sur urlHash).
  if (toInsert.length > 0) {
    const insertedRows = await db
      .insert(articles)
      .values(toInsert)
      .onConflictDoNothing({ target: articles.urlHash })
      .returning({ id: articles.id, source: articles.source });
    inserted = insertedRows.length;
    for (const row of insertedRows) {
      const bucket = perSource[row.source];
      if (bucket) bucket.inserted += 1;
    }
  }

  for (const update of heliusImageUpdates) {
    await db
      .update(articles)
      .set({ imageUrl: update.imageUrl })
      .where(eq(articles.urlHash, update.urlHash));
  }

  // Resume FR auto du backlog (articles sans resume), garde-fous dans summarize-batch.
  const summary = await summarizePending();

  await db
    .insert(meta)
    .values({ key: "lastRefresh", value: String(now) })
    .onConflictDoUpdate({ target: meta.key, set: { value: String(now) } });

  const sourceErrors = Object.entries(perSource).filter(([, v]) => v.error);
  const hasError = sourceErrors.length > 0 || summary.failed > 0;
  await logEvent({
    level: hasError ? "error" : "info",
    event: "ingest",
    message:
      `articles ${inserted}/${total} insérés; résumés ${summary.summarized}/${summary.candidates} (échecs ${summary.failed})` +
      (sourceErrors.length ? `; sources en erreur: ${sourceErrors.map(([s]) => s).join(", ")}` : "") +
      (summary.skippedReason ? `; résumé: ${summary.skippedReason}` : ""),
    data: { inserted, total, perSource, summary },
  });

  return { total, inserted, perSource, summary };
}

export async function getLastRefresh(): Promise<number | null> {
  const row = await db.query.meta.findFirst({ where: (m, { eq }) => eq(m.key, "lastRefresh") });
  return row?.value ? Number(row.value) : null;
}
