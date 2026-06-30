function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  return /^(1|true|yes|on)$/i.test(value.trim());
}

function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export interface AutoSummaryConfig {
  enabled: boolean;
  max: number;
  concurrency: number;
  modelId: string | undefined;
}

export function autoSummaryConfig(): AutoSummaryConfig {
  return {
    enabled: bool(process.env.AUTO_SUMMARIZE, true),
    max: int(process.env.AUTO_SUMMARIZE_MAX, 12),
    concurrency: Math.max(1, int(process.env.AUTO_SUMMARIZE_CONCURRENCY, 2)),
    modelId: process.env.AUTO_SUMMARIZE_MODEL || undefined,
  };
}
