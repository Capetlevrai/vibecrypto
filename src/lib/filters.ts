import type { Filters } from "./queries";

export function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : v ? [v] : [];
}

export function parseFilters(p: Record<string, string | string[] | undefined>): Filters {
  return {
    assets: asArray(p.asset),
    exchanges: asArray(p.exchange),
    sources: asArray(p.source),
    search: typeof p.q === "string" ? p.q : undefined,
    hasSummary: p.summary === "1" ? true : undefined,
    limit: 150,
  };
}
