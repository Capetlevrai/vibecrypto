"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function refresh() {
    setMsg(null);
    startTransition(async () => {
      try {
        const headers: Record<string, string> = {};
        const pub = process.env.NEXT_PUBLIC_CRON_SECRET;
        if (pub) headers["x-cron-secret"] = pub;
        const res = await fetch("/api/cron/refresh", { method: "POST", headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Échec");
        setMsg(`+${data.inserted ?? 0} nouveaux`);
        router.refresh();
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={refresh}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-black shadow-lg shadow-[var(--accent)]/20 transition hover:brightness-110 disabled:opacity-50"
      >
        <span className={pending ? "inline-block animate-spin" : "inline-block"}>↻</span>
        {pending ? "Rafraîchissement…" : "Actualiser"}
      </button>
      {msg && <span className="text-xs text-[var(--muted)]">{msg}</span>}
    </div>
  );
}
