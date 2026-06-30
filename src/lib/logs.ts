import { db } from "./db/client";
import { logs } from "./db/schema";
import { desc, lt } from "drizzle-orm";

export type LogLevel = "info" | "warn" | "error";

const MAX_LOGS = 300;

// Masque tout secret potentiel avant ecriture/exposition (projet open source, prod publique).
export function redact(input: string): string {
  return input
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[JWT_REDACTED]")
    .replace(/libsql:\/\/[^\s"']+/gi, "libsql://[DB_REDACTED]")
    .replace(/(authToken|auth_token|token|apikey|api_key|secret|password)["']?\s*[:=]\s*["']?[A-Za-z0-9._-]+/gi, "$1=[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/sk-[A-Za-z0-9._-]{10,}/g, "[KEY_REDACTED]");
}

function redactData(data: unknown): unknown {
  if (data === undefined) return undefined;
  try {
    return JSON.parse(redact(JSON.stringify(data)));
  } catch {
    return undefined;
  }
}

// Ecrit un evenement de log (best-effort: n'echoue jamais l'appelant).
export async function logEvent(entry: {
  level: LogLevel;
  event: string;
  message?: string;
  data?: unknown;
}): Promise<void> {
  try {
    const now = Date.now();
    await db.insert(logs).values({
      ts: now,
      level: entry.level,
      event: entry.event,
      message: entry.message ? redact(entry.message).slice(0, 2000) : null,
      data: redactData(entry.data) ?? null,
    });
    // Pruning best-effort: garde les logs des 14 derniers jours.
    await db.delete(logs).where(lt(logs.ts, now - 14 * 24 * 3600 * 1000));
  } catch {
    /* le logging ne doit jamais casser l'ingestion */
  }
}

export async function recentLogs(limit = MAX_LOGS) {
  try {
    return await db.select().from(logs).orderBy(desc(logs.ts)).limit(Math.min(limit, MAX_LOGS));
  } catch {
    return [];
  }
}
