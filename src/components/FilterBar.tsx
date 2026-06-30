"use client";

import { ASSETS, ASSET_LABELS, EXCHANGES, EXCHANGE_LABELS, SOURCES, SOURCE_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

export interface FilterState {
  assets: string[];
  exchanges: string[];
  sources: string[];
  q: string;
  hasSummary: boolean;
}

export type Facet = "assets" | "exchanges" | "sources";

export function FilterBar({
  filters,
  onToggle,
  onSearch,
  onToggleSummary,
  onReset,
  total,
}: {
  filters: FilterState;
  onToggle: (facet: Facet, value: string) => void;
  onSearch: (q: string) => void;
  onToggleSummary: () => void;
  onReset: () => void;
  total: number;
}) {
  const anyFilter =
    filters.assets.length +
      filters.exchanges.length +
      filters.sources.length +
      (filters.q ? 1 : 0) +
      (filters.hasSummary ? 1 : 0) >
    0;

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5">
        <FilterGroup label="Assets">
          {ASSETS.map((a) => (
            <Chip key={a} active={filters.assets.includes(a)} onClick={() => onToggle("assets", a)} tone="asset">
              {ASSET_LABELS[a]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Exchanges">
          {EXCHANGES.map((e) => (
            <Chip key={e} active={filters.exchanges.includes(e)} onClick={() => onToggle("exchanges", e)} tone="exchange">
              {EXCHANGE_LABELS[e]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Sources">
          {SOURCES.map((s) => (
            <Chip key={s} active={filters.sources.includes(s)} onClick={() => onToggle("sources", s)} tone="bone">
              {SOURCE_LABELS[s]}
            </Chip>
          ))}
        </FilterGroup>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <div className="relative min-w-[200px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--muted)]">
              /
            </span>
            <input
              type="search"
              placeholder="rechercher (titre, résumé…)"
              value={filters.q}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-7 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--marker)]"
            />
          </div>
          <Chip active={filters.hasSummary} onClick={onToggleSummary} tone="asset">
            Avec résumé
          </Chip>
          {anyFilter && (
            <button
              onClick={onReset}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--muted)] transition-colors hover:border-[var(--alert)]/50 hover:text-[var(--alert)]"
            >
              Reset
            </button>
          )}
          <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <span className="text-[var(--foreground)]">{total}</span> résultats
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-[68px] shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

const TONES = {
  asset: "border-[var(--asset)] bg-[var(--asset)] text-[var(--background)]",
  exchange: "border-[var(--exchange)] bg-[var(--exchange)] text-[var(--background)]",
  bone: "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]",
} as const;

function Chip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone: keyof typeof TONES;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide transition duration-150",
        active
          ? TONES[tone]
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]/40 hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}
