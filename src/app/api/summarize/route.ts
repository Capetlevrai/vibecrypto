import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { summarizeArticle } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { id?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, model } = body;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const article = rows[0];
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  try {
    const result = await summarizeArticle({
      title: article.title,
      excerpt: article.excerpt,
      rawContent: article.rawContent,
      modelId: model,
    });
    await db
      .update(articles)
      .set({
        titleFr: result.titleFr,
        hook: result.hook,
        summary: result.summary,
        summaryModel: result.model,
        summaryAt: Date.now(),
      })
      .where(eq(articles.id, id));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
