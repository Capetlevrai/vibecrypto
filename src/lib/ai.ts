import { generateText, type LanguageModel } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export type ModelKind = "openai-compat" | "anthropic";

export interface ModelDef {
  id: string;
  label: string;
  kind: ModelKind;
  baseURL?: string;
  apiKey: string;
  modelId: string;
}

function def(
  id: string,
  label: string,
  apiKey: string | undefined,
  opts: Omit<ModelDef, "id" | "label" | "apiKey">,
): ModelDef | null {
  if (!apiKey || apiKey.trim().length === 0) return null;
  return { id, label, apiKey, ...opts };
}

export function availableModels(): ModelDef[] {
  const env = process.env;
  const models: (ModelDef | null)[] = [
    def("glm-zai", "GLM (Z.AI)", env.ZAI_API_KEY, {
      kind: "openai-compat",
      baseURL: env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4",
      modelId: env.ZAI_MODEL || "glm-4.6",
    }),
    def("glm-openrouter", "GLM (OpenRouter)", env.OPENROUTER_API_KEY, {
      kind: "openai-compat",
      baseURL: "https://openrouter.ai/api/v1",
      modelId: env.OPENROUTER_MODEL || "zai/glm-4.6",
    }),
    def("grok", "Grok (xAI)", env.XAI_API_KEY, {
      kind: "openai-compat",
      baseURL: "https://api.x.ai/v1",
      modelId: env.XAI_MODEL || "grok-4-fast",
    }),
    def("claude", "Claude (Anthropic)", env.ANTHROPIC_API_KEY, {
      kind: "anthropic",
      modelId: env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    }),
    def("openai", "OpenAI", env.OPENAI_API_KEY, {
      kind: "openai-compat",
      baseURL: "https://api.openai.com/v1",
      modelId: env.OPENAI_MODEL || "gpt-4o-mini",
    }),
    def("deepseek", "DeepSeek", env.DEEPSEEK_API_KEY, {
      kind: "openai-compat",
      baseURL: "https://api.deepseek.com",
      modelId: env.DEEPSEEK_MODEL || "deepseek-chat",
    }),
  ];
  return models.filter((m): m is ModelDef => m !== null);
}

export function getClient(m: ModelDef): LanguageModel {
  if (m.kind === "anthropic") {
    const provider = createAnthropic({ apiKey: m.apiKey });
    return provider(m.modelId);
  }
  const provider = createOpenAICompatible({
    name: m.id,
    baseURL: m.baseURL!,
    apiKey: m.apiKey,
  });
  return provider(m.modelId);
}

export function resolveModel(modelId: string | undefined): ModelDef {
  const models = availableModels();
  if (models.length === 0) throw new Error("Aucun provider IA configuré. Renseigne au moins une clé (ZAI_API_KEY, OPENROUTER_API_KEY, XAI_API_KEY, ANTHROPIC_API_KEY…).");
  if (!modelId) return models[0];
  return models.find((m) => m.id === modelId) ?? models[0];
}

const summarySchema = z.object({
  hook: z.string().min(1).max(280),
  summary: z.string().min(1).max(1000),
});

export interface SummaryResult {
  hook: string;
  summary: string;
  model: string;
}

// Extraction tolerante d'un objet JSON depuis une reponse LLM (fences, texte autour).
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(candidate);
}

// Resume FR via generateText + JSON tolerant (compatible avec les endpoints qui ne
// supportent pas la sortie structuree, ex: GLM coding plan, DeepSeek).
export async function summarizeArticle(opts: {
  title: string;
  excerpt?: string | null;
  rawContent?: string | null;
  modelId?: string;
}): Promise<SummaryResult> {
  const model = resolveModel(opts.modelId);
  const content = [opts.excerpt, opts.rawContent].filter(Boolean).join("\n\n").slice(0, 8000) || opts.title;

  const { text } = await generateText({
    model: getClient(model),
    temperature: 0.3,
    system:
      "Tu es un analyste crypto francophone expérimenté qui traduit et synthétise en " +
      "français toute actualité crypto, quelle que soit sa langue d'origine. " +
      "Tu rédiges pour un créateur de contenu (Twitter, YouTube, Twitch, presse) qui veut " +
      "l'essentiel pour préparer des best-of. Français naturel et fluide, sans anglicismes " +
      "inutiles, factuel et percutant, sans hype. Conserve tels quels les tickers (BTC, ETH, " +
      "SOL, HYPE, TAO), les noms de protocoles/exchanges (Uniswap, Aave, OKX, Binance, " +
      "Hyperliquid) et les chiffres. Tu réponds STRICTEMENT en JSON, sans texte autour.",
    prompt:
      `À partir de l'actualité suivante, produis un objet JSON.\n\n` +
      `Titre: ${opts.title}\n\n` +
      `Contenu brut:\n${content}\n\n` +
      `Format de sortie EXACT (JSON valide, rien d'autre):\n` +
      `{"hook": "...", "summary": "..."}\n\n` +
      `Contraintes:\n` +
      `- hook: UNE phrase d'accroche percutante en français (max 220 caractères).\n` +
      `- summary: EXACTEMENT 2 courts paragraphes en français séparés par "\\n\\n" qui ` +
      `expliquent de quoi ça parle, le contexte et l'enjeu (max 800 caractères).\n` +
      `- Reste factuel. Ne date pas ("récemment", "aujourd'hui"). Aucune invention.`,
  });

  let parsed: { hook: string; summary: string };
  try {
    parsed = summarySchema.parse(extractJson(text));
  } catch {
    // Repli: pas de JSON exploitable -> on utilise le texte brut comme resume.
    const fallback = text.trim().slice(0, 800);
    if (!fallback) throw new Error("Réponse IA vide");
    parsed = { hook: opts.title.slice(0, 220), summary: fallback };
  }

  return { hook: parsed.hook.trim(), summary: parsed.summary.trim(), model: model.id };
}
