import * as cheerio from "cheerio";
import type { RawArticle, SourceAdapter } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

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
    const out: RawArticle[] = [];

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
      out.push({
        title,
        url: href,
        imageUrl: imgSrc || undefined,
        excerpt: excerpt.slice(0, 600),
        rawContent: `${title}. ${excerpt}`.slice(0, 6000),
        publishedAt: dt ? Date.parse(dt) : undefined,
        source: "todayonchain",
        sourceName: sourceName || "TodayOnChain",
      });
    });

    return out;
  },
};
