import * as cheerio from "cheerio";
import type { RawArticle, SourceAdapter } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface WpRendered {
  rendered?: string;
}

interface WpPost {
  link?: string;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  date_gmt?: string;
  date?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
}

function toText(html: string): string {
  if (!html) return "";
  return cheerio.load(`<root>${html}</root>`)("root").text().trim();
}

export const coinacademy: SourceAdapter = {
  source: "coinacademy",
  label: "Coinacademy",
  async fetch(): Promise<RawArticle[]> {
    const res = await fetch(
      "https://coinacademy.fr/wp-json/wp/v2/posts?per_page=40&_embed=1",
      {
        headers: { "User-Agent": UA, Accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`coinacademy HTTP ${res.status}`);
    const posts = (await res.json()) as WpPost[];
    const out: RawArticle[] = [];
    for (const post of Array.isArray(posts) ? posts : []) {
      const title = toText(post.title?.rendered ?? "");
      const url = (post.link ?? "").trim();
      if (!title || !url) continue;
      const excerpt = toText(post.excerpt?.rendered ?? "");
      const rawContent = (post.content?.rendered ?? excerpt).trim();
      const featured = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
      const iso = post.date_gmt ? `${post.date_gmt}Z` : post.date;
      out.push({
        title,
        url,
        imageUrl: featured?.trim() || undefined,
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
