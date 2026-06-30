import type { RawArticle, SourceAdapter } from "./types";

// CryptoPanic API v1 : https://cryptopanic.com/developers/api/
// Token gratuit via compte. On filtre sur les devises d'intérêt.
const CURRENCIES = "BTC,ETH,SOL";

export const cryptopanic: SourceAdapter = {
  source: "cryptopanic",
  label: "CryptoPanic",
  async fetch(): Promise<RawArticle[]> {
    const token = process.env.CRYPTOPANIC_TOKEN;
    if (!token) return []; // source désactivée sans token

    const url = new URL("https://cryptopanic.com/api/v1/posts/");
    url.searchParams.set("auth_token", token);
    url.searchParams.set("public", "true");
    url.searchParams.set("currencies", CURRENCIES);
    url.searchParams.set("kind", "news");
    url.searchParams.set("filter", "hot");

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`cryptopanic HTTP ${res.status}`);
    const data = (await res.json()) as {
      results?: Array<Record<string, unknown>>;
    };

    const results = data.results ?? [];
    const out: RawArticle[] = [];
    for (const p of results) {
      const title = String(p.title ?? "").trim();
      if (!title) continue;
      const source = p.source as { title?: string; domain?: string; url?: string } | undefined;
      // url direct vers l'article source si dispo, sinon page CryptoPanic
      const directUrl =
        (source?.url as string | undefined) ?? String(p.url ?? "");
      const published =
        (p.published_at as string | undefined) ??
        (p.created_at as string | undefined);
      const description = typeof p.description === "string" ? p.description.trim() : "";
      const excerpt = description || title;
      out.push({
        title,
        url: directUrl,
        excerpt,
        rawContent: description ? `${title}. ${description}` : title,
        publishedAt: published ? Date.parse(published) : undefined,
        source: "cryptopanic",
        sourceName: source?.title ?? source?.domain ?? "CryptoPanic",
      });
    }
    return out;
  },
};
