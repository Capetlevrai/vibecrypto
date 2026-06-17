"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES } from "./LanguageProvider";
import { cn } from "@/lib/cn";

export function LanguageSelector() {
  const { lang, setLang, loading } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm transition hover:border-[var(--accent)]/50"
        title="Langue d'affichage"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-medium uppercase">
          {current.code === "original" ? "AUTO" : current.code}
        </span>
        {loading && (
          <span className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:bg-[var(--background)]",
                l.code === lang && "text-[var(--accent)]",
              )}
            >
              <span className="text-base">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
