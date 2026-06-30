import type { RawArticle, SourceAdapter } from "./types";
import { makeParser, pickImage } from "./rss";

const parser = makeParser();

export const helius: SourceAdapter = {
  source: "helius",
  label: "Helius",
  async fetch(): Promise<RawArticle[]> {
    const feed = await parser.parseURL("https://www.helius.dev/blog/rss.xml");
    const items = feed.items ?? [];
    const out: RawArticle[] = [];
    for (const item of items) {
      const title = (item.title ?? "").trim();
      const url = (item.link ?? "").trim();
      if (!title || !url) continue;
      const excerpt = (item.contentSnippet ?? item.content ?? "").trim();
      const rawContent = (item.content ?? excerpt).trim();
      const iso = item.isoDate ?? item.pubDate;
      out.push({
        title,
        url,
        imageUrl: pickImage(item as Record<string, unknown>, { baseUrl: "https://www.helius.dev" }),
        excerpt: excerpt.slice(0, 600),
        rawContent: rawContent.slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "helius",
        sourceName: "Helius",
      });
    }
    return out;
  },
};
