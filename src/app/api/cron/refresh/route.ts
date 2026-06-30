import { NextRequest, NextResponse } from "next/server";
import { runIngest } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const preferredRegion = "cdg1";

type AuthResult = { ok: true } | { ok: false; status: number; error: string };

function authorized(req: NextRequest): AuthResult {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // En production (Vercel), refuser plutot que d'exposer l'endpoint si la
    // variable a ete oubliee. En dev local, on laisse passer pour le confort.
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return { ok: false, status: 500, error: "CRON_SECRET manquant en production" };
    }
    return { ok: true };
  }
  const fromQuery = req.nextUrl.searchParams.get("secret");
  const fromHeader = req.headers.get("x-cron-secret");
  if (fromQuery === secret || fromHeader === secret) return { ok: true };
  return { ok: false, status: 401, error: "unauthorized" };
}

async function handle(req: NextRequest) {
  const auth = authorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const only = req.nextUrl.searchParams.get("sources");
  try {
    const result = await runIngest({ only: only ? only.split(",") : undefined });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
