import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    titleFr: text("title_fr"),
    hook: text("hook"),
    excerpt: text("excerpt"),
    summary: text("summary"),
    summaryModel: text("summary_model"),
    summaryAt: integer("summary_at"),
    url: text("url").notNull(),
    finalUrl: text("final_url"),
    imageUrl: text("image_url"),
    urlHash: text("url_hash").notNull(),
    source: text("source").notNull(),
    sourceName: text("source_name"),
    publishedAt: integer("published_at"),
    fetchedAt: integer("fetched_at").notNull(),
    assets: text("assets", { mode: "json" }).$type<string[]>(),
    exchanges: text("exchanges", { mode: "json" }).$type<string[]>(),
    rawContent: text("raw_content"),
    score: real("score").notNull().default(0),
  },
  (t) => [
    uniqueIndex("articles_url_hash_idx").on(t.urlHash),
    index("articles_published_idx").on(t.publishedAt),
    index("articles_source_idx").on(t.source),
  ],
);

export type ArticleRow = typeof articles.$inferSelect;
export type NewArticleRow = typeof articles.$inferInsert;

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export type MetaRow = typeof meta.$inferSelect;

// Journal d'evenements (ingestion, erreurs, rate-limit) pour le debug prod.
export const logs = sqliteTable(
  "logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ts: integer("ts").notNull(),
    level: text("level").notNull(),
    event: text("event").notNull(),
    message: text("message"),
    data: text("data", { mode: "json" }),
  },
  (t) => [index("logs_ts_idx").on(t.ts)],
);

export type LogRow = typeof logs.$inferSelect;
