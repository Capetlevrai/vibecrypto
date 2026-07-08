import type { RawArticle, SourceAdapter } from "./types";
import { makeParser, pickImage } from "./rss";

const parser = makeParser();

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export const bitcoinmagazine: SourceAdapter = {
  source: "bitcoinmagazine",
  label: "Bitcoin Magazine",
  async fetch(): Promise<RawArticle[]> {
    const res = await fetch("https://bitcoinmagazine.com/feed", {
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`bitcoinmagazine HTTP ${res.status}`);
    const feed = await parser.parseString(await res.text());
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
        imageUrl: pickImage(item as Record<string, unknown>, { baseUrl: "https://bitcoinmagazine.com" }),
        excerpt: excerpt.slice(0, 600),
        rawContent: rawContent.slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "bitcoinmagazine",
        sourceName: "Bitcoin Magazine",
      });
    }
    return out;
  },
};
