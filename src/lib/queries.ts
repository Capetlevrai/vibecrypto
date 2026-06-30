import { db } from "./db/client";
import { articles } from "./db/schema";
import { and, count, desc, inArray, isNotNull, like, or, eq } from "drizzle-orm";
import type { Article } from "./types";

export interface Filters {
  assets?: string[];
  exchanges?: string[];
  sources?: string[];
  search?: string;
  hasSummary?: boolean;
  limit?: number;
}

function mapRow(r: typeof articles.$inferSelect): Article {
  return {
    id: r.id,
    title: r.title,
    titleFr: r.titleFr,
    hook: r.hook,
    excerpt: r.excerpt,
    summary: r.summary,
    summaryModel: r.summaryModel,
    summaryAt: r.summaryAt,
    url: r.url,
    imageUrl: r.imageUrl,
    source: r.source as Article["source"],
    sourceName: r.sourceName,
    publishedAt: r.publishedAt,
    fetchedAt: r.fetchedAt,
    assets: (r.assets as string[] | null) ?? [],
    exchanges: (r.exchanges as string[] | null) ?? [],
    rawContent: r.rawContent,
    score: r.score,
  };
}

export async function getArticles(f: Filters = {}): Promise<Article[]> {
  const conds = [];
  if (f.sources && f.sources.length) conds.push(inArray(articles.source, f.sources));
  if (f.assets) for (const a of f.assets) conds.push(like(articles.assets, `%"${a}"%`));
  if (f.exchanges) for (const e of f.exchanges) conds.push(like(articles.exchanges, `%"${e}"%`));
  if (f.search && f.search.trim()) {
    const s = `%${f.search.trim()}%`;
    conds.push(or(like(articles.title, s), like(articles.summary, s), like(articles.excerpt, s)));
  }
  if (f.hasSummary) conds.push(isNotNull(articles.summary));

  const rows = await db
    .select()
    .from(articles)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(articles.publishedAt), desc(articles.fetchedAt))
    .limit(f.limit ?? 120);

  return rows.map(mapRow);
}

export async function getArticle(id: string): Promise<Article | null> {
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getArticleCounts(): Promise<{ total: number; withSummary: number }> {
  const [row] = await db
    .select({
      total: count(),
      withSummary: count(articles.summary),
    })
    .from(articles);
  return {
    total: row?.total ?? 0,
    withSummary: row?.withSummary ?? 0,
  };
}
