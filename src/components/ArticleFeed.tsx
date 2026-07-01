"use client";

import { Fragment, useMemo, useState, useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleRow } from "@/components/ArticleRow";
import { PartnerCard } from "@/components/PartnerCard";
import { FilterBar, type FilterState, type Facet } from "@/components/FilterBar";
import { cn } from "@/lib/cn";

const PARTNER_FIRST = 4;
const PARTNER_INTERVAL = 14;

function showPartnerAfter(index: number, total: number): boolean {
  const n = index + 1;
  if (n < PARTNER_FIRST || index >= total - 1) return false;
  return (n - PARTNER_FIRST) % PARTNER_INTERVAL === 0;
}

const EMPTY_FILTERS: FilterState = { assets: [], exchanges: [], sources: [], q: "", hasSummary: false };

export type Lang = "fr" | "source";
type View = "list" | "grid";
const VIEW_KEY = "vc:view";
const LANG_KEY = "vc:lang";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): View {
  return window.localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list";
}
function getServerSnapshot(): View {
  return "list";
}
function select(next: View) {
  window.localStorage.setItem(VIEW_KEY, next);
  listeners.forEach((l) => l());
}

function getLangSnapshot(): Lang {
  return window.localStorage.getItem(LANG_KEY) === "source" ? "source" : "fr";
}
function getLangServerSnapshot(): Lang {
  return "fr";
}
function selectLang(next: Lang) {
  window.localStorage.setItem(LANG_KEY, next);
  listeners.forEach((l) => l());
}

export function ArticleFeed({ articles }: { articles: Article[] }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const lang = useSyncExternalStore(subscribe, getLangSnapshot, getLangServerSnapshot);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return articles.filter((a) => {
      if (filters.assets.length && !filters.assets.some((x) => a.assets.includes(x))) return false;
      if (filters.exchanges.length && !filters.exchanges.some((x) => a.exchanges.includes(x))) return false;
      if (filters.sources.length && !filters.sources.includes(a.source)) return false;
      if (filters.hasSummary && !a.summary) return false;
      if (q) {
        const hay = [a.title, a.titleFr, a.hook, a.summary, a.excerpt]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [articles, filters]);

  const toggle = (facet: Facet, value: string) =>
    setFilters((f) => {
      const cur = f[facet];
      return { ...f, [facet]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });

  return (
    <div>
      <FilterBar
        filters={filters}
        onToggle={toggle}
        onSearch={(q) => setFilters((f) => ({ ...f, q }))}
        onToggleSummary={() => setFilters((f) => ({ ...f, hasSummary: !f.hasSummary }))}
        onReset={() => setFilters(EMPTY_FILTERS)}
        total={filtered.length}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)]/60 p-0.5 font-mono text-[11px] font-medium">
          <Segment active={lang === "fr"} onClick={() => selectLang("fr")} label="Afficher en français">
            FR
          </Segment>
          <Segment active={lang === "source"} onClick={() => selectLang("source")} label="Afficher la langue source">
            Source
          </Segment>
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)]/60 p-0.5">
          <IconToggle label="Vue liste" active={view === "list"} onClick={() => select("list")}>
            <ListIcon />
          </IconToggle>
          <IconToggle label="Vue blocs" active={view === "grid"} onClick={() => select("grid")}>
            <GridIcon />
          </IconToggle>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
          Aucune dépêche pour ces filtres
        </div>
      ) : view === "list" ? (
        <div className="-mx-2 flex flex-col gap-2 sm:mx-0">
          {filtered.map((a, i) => (
            <Fragment key={a.id}>
              <ArticleRow article={a} lang={lang} />
              {showPartnerAfter(i, filtered.length) && <PartnerCard />}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="-mx-2 grid grid-cols-1 items-stretch gap-4 sm:mx-0 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function Segment({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "rounded px-2.5 py-1 uppercase tracking-[0.1em] transition-colors",
        active
          ? "bg-[var(--marker)] text-[var(--background)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}

function IconToggle({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded p-1.5 transition-colors",
        active
          ? "bg-[var(--marker)] text-[var(--background)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}

function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
