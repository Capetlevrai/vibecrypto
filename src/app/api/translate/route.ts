import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel, getClient } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  ar: "Arabic",
};

export async function POST(req: Request) {
  let body: { lang?: string; items?: Array<{ id: string; title: string; hook?: string }> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lang, items } = body;
  if (!lang || lang === "original" || !items?.length) {
    return NextResponse.json({ results: {} });
  }

  const targetName = LANG_NAMES[lang] ?? lang;

  try {
    const model = resolveModel(undefined);
    const { object } = await generateObject({
      model: getClient(model),
      schemaName: "translations",
      schema: z.object({
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            hook: z.string(),
          }),
        ),
      }),
      temperature: 0.2,
      system:
        `You are a professional crypto news translator. Translate to ${targetName}. ` +
        `Rules: keep token tickers (BTC, ETH, SOL, HYPE…), exchange names (OKX, Binance, " +
        "Coinbase…), URLs, and numbers exactly as-is. Be natural and concise. ` +
        `Return one translation per item, preserving the id.`,
      prompt:
        `Translate the "title" and "hook" of each item to ${targetName}.\n\n` +
        `Items (JSON):\n${JSON.stringify(items)}`,
    });

    const results: Record<string, { title: string; hook: string }> = {};
    for (const t of object.items) {
      results[t.id] = { title: t.title, hook: t.hook };
    }
    return NextResponse.json({ lang, results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
