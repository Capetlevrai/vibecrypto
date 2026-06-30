import type { RawArticle, SourceAdapter } from "./types";
import { makeParser, pickImage } from "./rss";

const parser = makeParser();

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function metaContent(html: string, name: string): string | undefined {
  const attr = name.includes(":") ? "property" : "name";
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${name}["'][^>]*>`,
    "i",
  );
  const match = html.match(re);
  return match?.[1] ?? match?.[2];
}

async function fetchCoverImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const image = metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
    return image ? new URL(image, url).toString() : undefined;
  } catch {
    return undefined;
  }
}

export const helius: SourceAdapter = {
  source: "helius",
  label: "Helius",
  async fetch(): Promise<RawArticle[]> {
    const feed = await parser.parseURL("https://www.helius.dev/blog/rss.xml");
    const items = feed.items ?? [];
    const out = await Promise.all(items.map(async (item): Promise<RawArticle | null> => {
      const title = (item.title ?? "").trim();
      const url = (item.link ?? "").trim();
      if (!title || !url) return null;
      const excerpt = (item.contentSnippet ?? item.content ?? "").trim();
      const rawContent = (item.content ?? excerpt).trim();
      const iso = item.isoDate ?? item.pubDate;
      const rssImage = pickImage(item as Record<string, unknown>, { baseUrl: "https://www.helius.dev" });
      const imageUrl = (await fetchCoverImage(url)) ?? rssImage;
      return {
        title,
        url,
        imageUrl,
        excerpt: excerpt.slice(0, 600),
        rawContent: rawContent.slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "helius",
        sourceName: "Helius",
      };
    }));
    return out.filter((article): article is RawArticle => article !== null);
  },
};
