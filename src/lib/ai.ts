import { generateObject, type LanguageModel } from "ai";
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
  hook: z.string().max(220),
  summary: z.string().max(800),
});

export interface SummaryResult {
  hook: string;
  summary: string;
  model: string;
}

export async function summarizeArticle(opts: {
  title: string;
  excerpt?: string | null;
  rawContent?: string | null;
  modelId?: string;
}): Promise<SummaryResult> {
  const model = resolveModel(opts.modelId);
  const content = [opts.excerpt, opts.rawContent].filter(Boolean).join("\n\n").slice(0, 8000) || opts.title;

  const { object } = await generateObject({
    model: getClient(model),
    schema: summarySchema,
    schemaName: "cryptoSummary",
    temperature: 0.3,
    system:
      "Tu es un analyste crypto francophone expérimenté. " +
      "Tu rédiges pour un créateur de contenu (Twitter, YouTube, Twitch, presse crypto) " +
      "qui a besoin d'aller à l'essentiel pour préparer des best-of. " +
      "Style: factuel, percutant, sans hype. En français.",
    prompt:
      `À partir de l'actualité suivante, produis un objet JSON en français.\n\n` +
      `Titre: ${opts.title}\n\n` +
      `Contenu brut:\n${content}\n\n` +
      `Contraintes:\n` +
      `- hook: UNE seule phrase d'accroche percutante (max 220 caractères) qui donne envie de cliquer.\n` +
      `- summary: EXACTEMENT 2 courts paragraphes (séparés par une ligne vide) qui expliquent de quoi ça parle, le contexte et l'enjeu. Max 800 caractères.\n` +
      `- Reste factuel. Ne date pas ("récemment", "aujourd'hui"). Pas d'invention.`,
  });

  return { hook: object.hook.trim(), summary: object.summary.trim(), model: model.id };
}
