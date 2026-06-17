import { NextResponse } from "next/server";
import { generateText } from "ai";
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
    const { text } = await generateText({
      model: getClient(model),
      temperature: 0.2,
      system:
        `You are a professional crypto news translator. Translate to ${targetName}. ` +
        `Keep token tickers (BTC, ETH, SOL, HYPE), exchange names (OKX, Binance, Coinbase), ` +
        `URLs, and numbers exactly as-is. Be natural and concise. ` +
        `Output ONLY valid JSON, no markdown fences, no explanation.`,
      prompt:
        `Translate the "title" and "hook" of each item to ${targetName}. ` +
        `Return a JSON object where each key is the item id, and the value is ` +
        `{"title": "...", "hook": "..."}. Output ONLY the JSON object.\n\n` +
        `Items:\n${JSON.stringify(items)}`,
    });

    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const results: Record<string, { title: string; hook: string }> = {};
    for (const [id, val] of Object.entries(parsed)) {
      const v = val as { title?: string; hook?: string };
      if (v.title) results[id] = { title: String(v.title), hook: String(v.hook ?? "") };
    }
    return NextResponse.json({ lang, results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
