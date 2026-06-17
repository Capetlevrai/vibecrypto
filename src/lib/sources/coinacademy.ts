import Parser from "rss-parser";
import type { RawArticle, SourceAdapter } from "./types";

const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": "VibeCrypto/1.0 (+https://github.com/Capetlevrai/vibecrypto)" },
});

function extractImage(item: Parser.Item): string | undefined {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;
  const html = item.content ?? "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1];
  return undefined;
}

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
      const rawContent = (item.content ?? excerpt).trim();
      const iso = item.isoDate ?? item.pubDate;
      out.push({
        title,
        url,
        imageUrl: extractImage(item),
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
