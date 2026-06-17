import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    hook: text("hook"),
    excerpt: text("excerpt"),
    summary: text("summary"),
    summaryModel: text("summary_model"),
    summaryAt: integer("summary_at"),
    url: text("url").notNull(),
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
