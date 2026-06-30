"use client";

import { useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleRow } from "@/components/ArticleRow";
import { cn } from "@/lib/cn";

type View = "list" | "grid";
const STORAGE_KEY = "vc:view";
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
  return window.localStorage.getItem(STORAGE_KEY) === "grid" ? "grid" : "list";
}

function getServerSnapshot(): View {
  return "list";
}

function select(next: View) {
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((l) => l());
}

export function ArticleFeed({ articles }: { articles: Article[] }) {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-0.5">
          <ToggleButton
            label="Vue liste"
            active={view === "list"}
            onClick={() => select("list")}
          >
            <ListIcon />
          </ToggleButton>
          <ToggleButton
            label="Vue blocs"
            active={view === "grid"}
            onClick={() => select("grid")}
          >
            <GridIcon />
          </ToggleButton>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex flex-col gap-2.5">
          {articles.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleButton({
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
        "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
        active
          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
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
