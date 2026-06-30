import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { articles } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { availableModels } from "@/lib/ai";
import { autoSummaryConfig } from "@/lib/config";
import { getLastRefresh } from "@/lib/ingest";
import { recentLogs, redact } from "@/lib/logs";
import { ADAPTERS } from "@/lib/sources";

export const dynamic = "force-dynamic";
export const preferredRegion = "cdg1";

// Endpoint de sante/debug. Public mais SANS secret (cles/tokens redacted en amont).
// Une IA (Claude/GPT via Codex) peut GET /api/status pour diagnostiquer la prod.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const logsLimit = Math.min(Number(searchParams.get("logs")) || 30, 200);
  try {
    const [c] = await db
      .select({
        total: count(),
        withSummary: count(articles.summary),
        withTitleFr: count(articles.titleFr),
      })
      .from(articles);
    const cfg = autoSummaryConfig();
    const lastRefresh = await getLastRefresh();
    const logs = await recentLogs(logsLimit);

    return NextResponse.json({
      ok: true,
      now: Date.now(),
      lastRefresh,
      staleMinutes: lastRefresh ? Math.round((Date.now() - lastRefresh) / 60000) : null,
      counts: c,
      models: availableModels().map((m) => m.id),
      autoSummarize: {
        enabled: cfg.enabled,
        max: cfg.max,
        concurrency: cfg.concurrency,
        model: cfg.modelId ?? null,
      },
      sources: ADAPTERS.map((a) => a.source),
      logs,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: redact(msg) }, { status: 500 });
  }
}
