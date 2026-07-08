"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);

  // Replie les groupes de filtres quand on scrolle vers le bas (hysteresis pour
  // eviter le clignotement), afin de liberer de la hauteur hors des ecrans 4K.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const next = collapsedRef.current ? y > 60 : y > 140;
        if (next === collapsedRef.current) return;
        collapsedRef.current = next;
        setCollapsed(next);
        if (next) setOpen(false);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const facetCount = filters.assets.length + filters.exchanges.length + filters.sources.length;
  const anyFilter = facetCount + (filters.q ? 1 : 0) + (filters.hasSummary ? 1 : 0) > 0;

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
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
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Afficher les filtres"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
              collapsed ? "" : "sm:hidden",
              facetCount > 0
                ? "border-[var(--marker)]/50 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)]",
            )}
          >
            Filtres
            {facetCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--marker)] px-1 text-[10px] font-semibold text-[var(--background)]">
                {facetCount}
              </span>
            )}
            <ChevronIcon className={cn("transition-transform", open && "rotate-180")} />
          </button>
        </div>

        <div className={cn("flex-col gap-2.5", open ? "flex" : collapsed ? "hidden" : "hidden sm:flex")}>
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
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
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
