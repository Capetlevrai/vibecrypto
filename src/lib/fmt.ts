import { format, formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDateTime(ms: number | null | undefined): string {
  if (!ms || Number.isNaN(ms)) return "Date inconnue";
  return format(new Date(ms), "d MMM à HH'h'mm", { locale: fr });
}

export function formatHour(ms: number | null | undefined): string {
  if (!ms || Number.isNaN(ms)) return "—";
  return format(new Date(ms), "d MMM, HH'h'", { locale: fr });
}

export function timeAgo(ms: number | null | undefined): string {
  if (!ms || Number.isNaN(ms)) return "—";
  return `il y a ${formatDistanceToNowStrict(new Date(ms), { locale: fr })}`;
}
