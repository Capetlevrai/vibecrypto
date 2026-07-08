import type { RawArticle, SourceAdapter } from "./types";
import { makeParser, pickImage } from "./rss";

const parser = makeParser();

const FEEDS = [
  "https://www.cryptoprowl.com/rss/ethereum",
  "https://www.cryptoprowl.com/rss/altcoins",
];

export const cryptoprowl: SourceAdapter = {
  source: "cryptoprowl",
  label: "CryptoProwl",
  async fetch(): Promise<RawArticle[]> {
    const feeds = await Promise.all(
      FEEDS.map((url) => parser.parseURL(url).catch(() => null)),
    );
    const out: RawArticle[] = [];
    const seen = new Set<string>();
    for (const feed of feeds) {
      for (const item of feed?.items ?? []) {
        const title = (item.title ?? "").trim();
        const url = (item.link ?? "").trim();
        if (!title || !url || seen.has(url)) continue;
        seen.add(url);
        const excerpt = (item.contentSnippet ?? item.content ?? "").trim();
        const rawContent = (item.content ?? excerpt).trim();
        const iso = item.isoDate ?? item.pubDate;
        out.push({
          title,
          url,
          imageUrl: pickImage(item as Record<string, unknown>, { baseUrl: "https://www.cryptoprowl.com" }),
          excerpt: excerpt.slice(0, 600),
          rawContent: rawContent.slice(0, 8000),
          publishedAt: iso ? Date.parse(iso) : undefined,
          source: "cryptoprowl",
          sourceName: "CryptoProwl",
        });
      }
    }
    return out;
  },
};
