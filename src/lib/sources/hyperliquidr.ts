import type { RawArticle, SourceAdapter } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface HyperliquidrBlog {
  title?: string;
  slug?: string;
  status?: string;
  image?: string;
  excerpt?: string;
  content?: string;
  date?: string;
  created?: string;
  author?: string;
}

export const hyperliquidr: SourceAdapter = {
  source: "hyperliquidr",
  label: "HyperliquidR",
  async fetch(): Promise<RawArticle[]> {
    const res = await fetch("https://api.hyperliquidr.xyz/api/blogs", {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`hyperliquidr HTTP ${res.status}`);
    const data = (await res.json()) as HyperliquidrBlog[];
    const blogs = Array.isArray(data) ? data : [];
    const out: RawArticle[] = [];
    for (const blog of blogs) {
      if (blog.status && blog.status !== "published") continue;
      const title = (blog.title ?? "").trim();
      const slug = (blog.slug ?? "").trim();
      if (!title || !slug) continue;
      const excerpt = (blog.excerpt ?? "").trim();
      const body = (blog.content ?? "").trim();
      const when = blog.created ?? blog.date;
      out.push({
        title,
        url: `https://www.hyperliquidr.xyz/post/${slug}`,
        imageUrl: blog.image?.trim() || undefined,
        excerpt: excerpt.slice(0, 600),
        rawContent: (body || `${title}. ${excerpt}`).slice(0, 8000),
        publishedAt: when ? Date.parse(when) : undefined,
        source: "hyperliquidr",
        sourceName: "HyperliquidR",
      });
    }
    return out;
  },
};
