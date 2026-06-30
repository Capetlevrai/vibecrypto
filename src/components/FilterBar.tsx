"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ASSETS, ASSET_LABELS, EXCHANGES, EXCHANGE_LABELS, SOURCES, SOURCE_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

const ASSET = "asset";
const EXCHANGE = "exchange";
const SOURCE = "source";

export function FilterBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const toggle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => params.append(key, v));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  const setSearch = (q: string) => {
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleSummary = () => {
    const params = new URLSearchParams(sp.toString());
    if (params.get("summary") === "1") params.delete("summary");
    else params.set("summary", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const reset = () => router.push(pathname, { scroll: false });

  const active = (key: string, value: string) => sp.getAll(key).includes(value);
  const anyFilter =
    sp.getAll(ASSET).length +
      sp.getAll(EXCHANGE).length +
      sp.getAll(SOURCE).length +
      (sp.get("q") ? 1 : 0) +
      (sp.get("summary") === "1" ? 1 : 0) >
    0;

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5">
        <FilterGroup label="Assets">
          {ASSETS.map((a) => (
            <Chip
              key={a}
              active={active(ASSET, a)}
              onClick={() => toggle(ASSET, a)}
              tone="accent"
            >
              {ASSET_LABELS[a]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Exchanges">
          {EXCHANGES.map((e) => (
            <Chip
              key={e}
              active={active(EXCHANGE, e)}
              onClick={() => toggle(EXCHANGE, e)}
              tone="accent2"
            >
              {EXCHANGE_LABELS[e]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Sources">
          {SOURCES.map((s) => (
            <Chip
              key={s}
              active={active(SOURCE, s)}
              onClick={() => toggle(SOURCE, s)}
              tone="muted"
            >
              {SOURCE_LABELS[s]}
            </Chip>
          ))}
        </FilterGroup>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Rechercher (titre, résumé…)"
            defaultValue={sp.get("q") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch((e.target as HTMLInputElement).value);
            }}
            className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <Chip active={sp.get("summary") === "1"} onClick={toggleSummary} tone="accent">
            Avec résumé
          </Chip>
          {anyFilter && (
            <button
              onClick={reset}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Réinitialiser
            </button>
          )}
          <span className="ml-auto text-xs text-[var(--muted)]">{total} articles</span>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-[70px] text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone: "accent" | "accent2" | "muted";
}) {
  const tones = {
    accent: "border-[var(--accent)]/60 bg-[var(--accent)]/20 text-[var(--accent)]",
    accent2: "border-[var(--accent-2)]/60 bg-[var(--accent-2)]/20 text-[var(--accent-2)]",
    muted: "border-[var(--foreground)]/40 bg-[var(--foreground)]/10 text-[var(--foreground)]",
  } as const;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition duration-150 hover:-translate-y-px",
        active
          ? tones[tone]
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]/40 hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}
