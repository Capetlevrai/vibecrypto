import type { RawArticle, SourceAdapter } from "./types";
import { makeParser, pickImage } from "./rss";

const parser = makeParser();

export const bscnews: SourceAdapter = {
  source: "bscnews",
  label: "BSC News",
  async fetch(): Promise<RawArticle[]> {
    const feed = await parser.parseURL("https://bsc.news/feed.xml");
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
        imageUrl: pickImage(item as Record<string, unknown>, { baseUrl: "https://bsc.news" }),
        excerpt: excerpt.slice(0, 600),
        rawContent: rawContent.slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "bscnews",
        sourceName: "BSC News",
      });
    }
    return out;
  },
};
