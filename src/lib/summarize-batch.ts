import { db } from "./db/client";
import { articles } from "./db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { summarizeArticle, availableModels } from "./ai";
import { autoSummaryConfig } from "./config";

export interface BatchSummaryResult {
  candidates: number;
  summarized: number;
  failed: number;
  skippedReason?: string;
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

  const pending = await db
    .select({
      id: articles.id,
      title: articles.title,
      excerpt: articles.excerpt,
      rawContent: articles.rawContent,
    })
    .from(articles)
    .where(isNull(articles.summary))
    .orderBy(desc(articles.score), desc(articles.publishedAt))
    .limit(cfg.max);

  if (pending.length === 0) {
    return { candidates: 0, summarized: 0, failed: 0 };
  }

  let summarized = 0;
  let failed = 0;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  await runWithConcurrency(pending, cfg.concurrency, async (row) => {
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
            hook: result.hook,
            summary: result.summary,
            summaryModel: result.model,
            summaryAt: Date.now(),
          })
          .where(eq(articles.id, row.id));
        summarized += 1;
        return;
      } catch {
        if (attempt < 2) await sleep(1500 * (attempt + 1));
      }
    }
    failed += 1;
  });

  return { candidates: pending.length, summarized, failed };
}
