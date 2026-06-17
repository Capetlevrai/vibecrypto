import Parser from "rss-parser";
import type { RawArticle, SourceAdapter } from "./types";

const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": "VibeCrypto/1.0 (+https://github.com/Capetlevrai/vibecrypto)" },
});

export const coinacademy: SourceAdapter = {
  source: "coinacademy",
  label: "Coinacademy",
  async fetch(): Promise<RawArticle[]> {
    const feed = await parser.parseURL("https://coinacademy.fr/feed/");
    const items = feed.items ?? [];
    const out: RawArticle[] = [];
    for (const item of items) {
      const title = (item.title ?? "").trim();
      const url = (item.link ?? "").trim();
      if (!title || !url) continue;
      const excerpt = (item.contentSnippet ?? item.content ?? "").trim();
      const rawContent = (item["content:encoded"] ?? item.content ?? excerpt).trim();
      const iso = item.isoDate ?? item.pubDate;
      out.push({
        title,
        url,
        excerpt: excerpt.slice(0, 600),
        rawContent: rawContent.slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "coinacademy",
        sourceName: "Coinacademy",
      });
    }
    return out;
  },
};
