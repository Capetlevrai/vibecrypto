"use client";

import { useEffect, useMemo, useState } from "react";

function shortAgo(ms: number | null | undefined, now: number) {
  if (!ms || Number.isNaN(ms)) return null;
  const delta = Math.max(0, now - ms);
  const seconds = Math.floor(delta / 1000);
  if (seconds < 45) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function LastRefreshIndicator({ initialLastRefresh }: { initialLastRefresh: number | null }) {
  const [lastRefresh, setLastRefresh] = useState(initialLastRefresh);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function syncStatus() {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { lastRefresh?: number | null };
        if (!cancelled && typeof data.lastRefresh === "number") {
          setLastRefresh(data.lastRefresh);
          setNow(Date.now());
        }
      } catch {
      }
    }

    syncStatus();
    const id = window.setInterval(() => {
      setNow(Date.now());
      syncStatus();
    }, 60000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const label = useMemo(() => shortAgo(lastRefresh, now), [lastRefresh, now]);
  if (!label) return null;

  return (
    <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] sm:inline">
      maj {label}
    </span>
  );
}
