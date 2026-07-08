import * as cheerio from "cheerio";
import type { RawArticle, SourceAdapter } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const CMS = "https://cms.solanafloor.com";

interface Translation {
  languages_code?: string;
  title?: string;
  description?: string;
  content?: string;
}

interface DirectusArticle {
  id?: number | string;
  status?: string;
  date?: string;
  slug?: string;
  image?: string;
  title?: string;
  translations?: Translation[];
}

function toText(html: string): string {
  if (!html) return "";
  return cheerio.load(`<root>${html}</root>`)("root").text().trim();
}

function pickTranslation(list: Translation[] | undefined): Translation | undefined {
  if (!list?.length) return undefined;
  return list.find((t) => t.languages_code?.startsWith("en")) ?? list[0];
}

export const solanafloor: SourceAdapter = {
  source: "solanafloor",
  label: "SolanaFloor",
  async fetch(): Promise<RawArticle[]> {
    const url = new URL(`${CMS}/items/articles`);
    url.searchParams.set("sort", "-date");
    url.searchParams.set("limit", "40");
    url.searchParams.set("filter[status][_eq]", "published");
    url.searchParams.set(
      "fields",
      "id,date,slug,image,title,translations.languages_code,translations.title,translations.description,translations.content",
    );
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`solanafloor HTTP ${res.status}`);
    const { data } = (await res.json()) as { data?: DirectusArticle[] };
    const out: RawArticle[] = [];
    for (const article of Array.isArray(data) ? data : []) {
      const slug = (article.slug ?? "").trim();
      const tr = pickTranslation(article.translations);
      const title = (tr?.title ?? article.title ?? "").trim();
      if (!slug || !title) continue;
      const excerpt = (tr?.description ?? "").trim();
      const body = toText(tr?.content ?? "");
      const iso = article.date ? `${article.date}Z` : undefined;
      out.push({
        title,
        url: `https://solanafloor.com/fr/news/${slug}`,
        imageUrl: article.image ? `${CMS}/assets/${article.image}` : undefined,
        excerpt: excerpt.slice(0, 600),
        rawContent: (body || `${title}. ${excerpt}`).slice(0, 8000),
        publishedAt: iso ? Date.parse(iso) : undefined,
        source: "solanafloor",
        sourceName: "SolanaFloor",
      });
    }
    return out;
  },
};
