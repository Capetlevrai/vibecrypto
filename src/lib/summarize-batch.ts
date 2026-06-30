import { db } from "./db/client";
import { articles } from "./db/schema";
import { eq, isNull, or, desc } from "drizzle-orm";
import { summarizeArticle, availableModels } from "./ai";
import { autoSummaryConfig } from "./config";

export interface BatchSummaryResult {
  candidates: number;
  summarized: number;
  failed: number;
  skippedReason?: string;
  errors?: string[];
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}

type PendingArticle = {
  id: string;
  title: string;
  titleFr: string | null;
  excerpt: string | null;
  rawContent: string | null;
  summary: string | null;
};

function looksEnglish(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  const matches = normalized.match(
    /\b(the|with|from|after|before|ahead|buying|launches|protects|prompts|hardware|based|privacy|whales|are|how|why|will|users|marketplace|autonomous|agent|economy|july|2026)\b/g,
  );
  return (matches?.length ?? 0) >= 2;
}

function needsSummaryRepair(row: PendingArticle): boolean {
  return (
    !row.summary ||
    !row.titleFr ||
    looksEnglish(row.titleFr) ||
    looksEnglish(row.summary)
  );
}

// Resume FR un lot d'articles sans resume (backlog), au fil des ingestions.
// Auto-reparant : si un run est interrompu (timeout), le run suivant reprend les
// articles restants. Garde-fous : plafond `max`, priorite au `score` puis recence,
// concurrence limitee, desactivable via env. Voir docs/INGESTION.md.
export async function summarizePending(): Promise<BatchSummaryResult> {
  const cfg = autoSummaryConfig();

  if (!cfg.enabled) {
    return { candidates: 0, summarized: 0, failed: 0, skippedReason: "AUTO_SUMMARIZE=off" };
  }
  if (cfg.max === 0) {
    return { candidates: 0, summarized: 0, failed: 0, skippedReason: "AUTO_SUMMARIZE_MAX=0" };
  }
  if (availableModels().length === 0) {
    return { candidates: 0, summarized: 0, failed: 0, skippedReason: "aucun modele IA configure" };
  }

  const primaryPending = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleFr: articles.titleFr,
      excerpt: articles.excerpt,
      rawContent: articles.rawContent,
      summary: articles.summary,
    })
    .from(articles)
    .where(or(isNull(articles.summary), isNull(articles.titleFr)))
    .orderBy(desc(articles.publishedAt), desc(articles.score))
    .limit(cfg.max);

  let pending: PendingArticle[] = primaryPending;
  if (pending.length < cfg.max) {
    const recent = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleFr: articles.titleFr,
        excerpt: articles.excerpt,
        rawContent: articles.rawContent,
        summary: articles.summary,
      })
      .from(articles)
      .orderBy(desc(articles.publishedAt), desc(articles.score))
      .limit(200);

    const seen = new Set(pending.map((row) => row.id));
    const repair = recent
      .filter((row) => !seen.has(row.id) && needsSummaryRepair(row))
      .slice(0, cfg.max - pending.length);
    pending = [...pending, ...repair];
  }

  if (pending.length === 0) {
    return { candidates: 0, summarized: 0, failed: 0 };
  }

  let summarized = 0;
  let failed = 0;
  const errors: string[] = [];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  await runWithConcurrency(pending, cfg.concurrency, async (row) => {
    let lastErr = "";
    // Jusqu'a 3 tentatives avec backoff: encaisse les rate-limits (429) transitoires.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await summarizeArticle({
          title: row.title,
          excerpt: row.excerpt,
          rawContent: row.rawContent,
          modelId: cfg.modelId,
        });
        await db
          .update(articles)
          .set({
            titleFr: result.titleFr,
            hook: result.hook,
            summary: result.summary,
            summaryModel: result.model,
            summaryAt: Date.now(),
          })
          .where(eq(articles.id, row.id));
        summarized += 1;
        return;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        if (attempt < 2) await sleep(1500 * (attempt + 1));
      }
    }
    failed += 1;
    if (lastErr && errors.length < 5 && !errors.includes(lastErr)) errors.push(lastErr);
  });

  return { candidates: pending.length, summarized, failed, errors: errors.length ? errors : undefined };
}
