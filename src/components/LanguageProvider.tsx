"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "original" | "fr" | "en" | "es" | "de" | "it" | "pt";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "original", label: "Original", flag: "🌐" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

interface Translation {
  title: string;
  hook: string | null;
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  translate: (id: string, original: { title: string; hook: string | null }) => Translation;
  loading: boolean;
}

const Ctx = createContext<LangCtx | null>(null);

function subscribeLang(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function getLangSnapshot(): Lang {
  return ((localStorage.getItem("vc:lang") as Lang) ?? "original");
}
function getServerLangSnapshot(): Lang {
  return "original";
}

function loadCache(lang: string): Record<string, Translation> {
  try {
    const raw = localStorage.getItem(`vc:tr:${lang}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCache(lang: string, data: Record<string, Translation>) {
  try {
    localStorage.setItem(`vc:tr:${lang}`, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function LanguageProvider({
  articles,
  children,
}: {
  articles: Array<{ id: string; title: string; hook: string | null }>;
  children: ReactNode;
}) {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLangSnapshot);
  const [fetched, setFetched] = useState<Record<string, Translation>>({});
  const [loading, setLoading] = useState(false);

  const effective = useMemo(() => {
    if (lang === "original") return {} as Record<string, Translation>;
    return { ...loadCache(lang), ...fetched };
  }, [lang, fetched]);

  useEffect(() => {
    if (lang === "original") return;
    const cached = loadCache(lang);
    const need = articles.filter((a) => !cached[a.id]);
    if (need.length === 0) return;

    let cancelled = false;
    const CHUNK = 20;

    (async () => {
      for (let i = 0; i < need.length; i += CHUNK) {
        if (cancelled) return;
        const chunk = need.slice(i, i + CHUNK);
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lang,
              items: chunk.map((a) => ({ id: a.id, title: a.title, hook: a.hook ?? "" })),
            }),
          });
          const data = await res.json();
          if (cancelled || !data.results) continue;
          const merged = { ...loadCache(lang), ...data.results };
          saveCache(lang, merged);
          setFetched({ ...merged });
        } catch {
          /* chunk failed — skip, will retry next time */
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, articles]);

  const setLang = useCallback(
    (l: Lang) => {
      try {
        if (l === "original") localStorage.removeItem("vc:lang");
        else localStorage.setItem("vc:lang", l);
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event("storage"));
      if (l !== "original") {
        const cached = loadCache(l);
        const need = articles.filter((a) => !cached[a.id]);
        if (need.length > 0) setLoading(true);
        setFetched({});
      }
    },
    [articles],
  );

  const translate = useCallback(
    (id: string, original: { title: string; hook: string | null }): Translation => {
      if (lang === "original") return { title: original.title, hook: original.hook };
      return effective[id] ?? { title: original.title, hook: original.hook };
    },
    [lang, effective],
  );

  return (
    <Ctx.Provider value={{ lang, setLang, translate, loading }}>{children}</Ctx.Provider>
  );
}

export function useLanguage(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
