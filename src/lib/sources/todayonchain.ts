import * as cheerio from "cheerio";
import type { RawArticle, SourceAdapter } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchFinalUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const $ = cheerio.load(html);
    const href = $(".visit-site-btn-sm a").first().attr("href")?.trim();
    return href ? new URL(href, url).toString() : undefined;
  } catch {
    return undefined;
  }
}

export const todayonchain: SourceAdapter = {
  source: "todayonchain",
  label: "TodayOnChain",
  async fetch(): Promise<RawArticle[]> {
    const res = await fetch("https://www.todayonchain.com/", {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`todayonchain HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const cards: {
      title: string;
      url: string;
      imageUrl?: string;
      excerpt: string;
      publishedAt?: number;
      sourceName: string;
    }[] = [];

    $(".api_article").each((_, el) => {
      const $card = $(el);
      const title = $card.find(".api_article_title").first().text().trim();
      if (!title) return;
      const excerpt = $card.find(".api_article_excerpt").first().text().trim();
      const sourceName = $card.find(".api_article_source").first().text().trim();
      const dt = $card.find("time").first().attr("datetime");
      const id = $card.attr("id");
      let imgSrc = $card.find(".api_article_image img").first().attr("src");
      if (imgSrc && !imgSrc.startsWith("http")) {
        imgSrc = `https://www.todayonchain.com${imgSrc}`;
      }
      const anchor = $card.closest("a").attr("href");
      let href = anchor ?? (id ? `/news/article/${id}/` : "");
      if (href && !href.startsWith("http")) href = `https://www.todayonchain.com${href}`;
      cards.push({
        title,
        url: href,
        imageUrl: imgSrc || undefined,
        excerpt: excerpt.slice(0, 600),
        publishedAt: dt ? Date.parse(dt) : undefined,
        sourceName: sourceName || "TodayOnChain",
      });
    });

    return Promise.all(cards.map(async (card): Promise<RawArticle> => ({
      title: card.title,
      url: card.url,
      finalUrl: await fetchFinalUrl(card.url),
      imageUrl: card.imageUrl,
      excerpt: card.excerpt,
      rawContent: `${card.title}. ${card.excerpt}`.slice(0, 6000),
      publishedAt: card.publishedAt,
      source: "todayonchain",
      sourceName: card.sourceName,
    })));
  },
};
