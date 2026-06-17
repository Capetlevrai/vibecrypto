# VibeCrypto — Instructions pour agents (Codex /通用)

> Ce projet est piloté en multi-agent : GLM 5.2 (opencode / OMP), Claude Code
> (voir `CLAUDE.md`), et Codex (ce fichier). **Lis-le en entier avant d'écrire du code.**

## C'est quoi

Veille crypto multi-sources agrégée, avec résumés IA en français (2 paragraphes),
pour alimenter la création de contenu (Twitter, YouTube, Twitch, presse).
Projets suivis : BTC, ETH, SOL, Hyperliquid (HYPE), Bittensor (TAO), Morpho, Aave,
Uniswap (UNI), Sky, pump.fun. Exchanges : OKX, Binance, Coinbase, Kraken, Bybit,
Hyperliquid.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19.2 + TypeScript strict
- **Tailwind CSS v4** (`@import "tailwindcss"`, thème via `@theme inline` dans `src/app/globals.css`)
- **Drizzle ORM** + **Turso (libSQL)** — dev = `file:local.db`, prod = Turso cloud
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/openai-compatible`, `@ai-sdk/anthropic`) — multi-modèles
- Scraping : `rss-parser`, `cheerio`, `fetch` natif

## ⚠️ Next.js 16 — ce n'est PAS le Next que tu connais

Avant d'écrire du code Next, lis les docs dans `node_modules/next/dist/docs/`.
Points critiques (breaking vs 15) :

- **API request async** : `params`, `searchParams`, `cookies()`, `headers()` sont des
  Promesses — `await`-les TOUJOURS. Utilise les helpers globaux `PageProps<'/route'>`
  et `RouteContext<'/route'>` (générés par `next dev`/`next build`/`next typegen`).
- **`next lint` supprimé** : on utilise `eslint` directement (`npm run lint`).
- **`middleware` → `proxy`** (renommage). On n'en utilise pas ici.
- **Pas de `runtimeConfig`** : variables d'env directes.
- **Cache Components (`cacheComponents: true`) est OFF** dans ce projet → modèle de
  caching "précédent" : on force `export const dynamic = "force-dynamic"` sur les
  routes qui lisent la DB pour avoir des données fraîches.
- Route Handlers (`src/app/api/.../route.ts`) : `export async function GET/POST(req: Request)`.

## Commandes

```bash
npm run dev          # dev server (Turbopack)
npm run build        # build prod
npm run typecheck    # tsc --noEmit  ← lance-le après chaque modif TS
npm run lint         # eslint
npm run db:push      # pousse le schéma Drizzle vers la DB (local ou Turso)
npm run refresh      # ingestion manuelle (lit .env.local)
```

## Architecture

```
src/lib/
  db/schema.ts          schéma Drizzle (table articles + meta)
  db/client.ts          client libSQL (Turso ou fichier local)
  sources/              un adaptateur par source → interface SourceAdapter
    coinacademy.ts      RSS
    todayonchain.ts     cheerio (HTML server-renderé, 70 articles/page)
    asksurf.ts          parse du flux RSC (self.__next_f.push) — pas de headless
    cryptopanic.ts      API officielle (token requis)
    index.ts            registre ADAPTERS
  tagging.ts            détection assets/exchanges (regex bornées)
  ai.ts                 registry multi-modèles + summarizeArticle (generateObject)
  ingest.ts             runIngest() : fetch + tag + dedup + insert idempotent
  queries.ts            getArticles(filters) / getArticle / counts
  filters.ts            parseFilters depuis searchParams
src/app/
  page.tsx              dashboard (server, force-dynamic, lit DB + searchParams)
  item/[id]/page.tsx    détail
  api/cron/refresh/     GET+POST ingestion (protégé par CRON_SECRET)
  api/summarize/        POST génère/regénère un résumé
src/components/         FilterBar, ArticleCard, RefreshButton (tous 'use client')
```

## Ajouter une source

1. Crée `src/lib/sources/<nom>.ts` exportant un `SourceAdapter` (`source`, `label`, `fetch()`).
2. Ajoute la valeur au type `Source` dans `src/lib/types.ts` + `SOURCE_LABELS`/`SOURCE_COLORS`.
3. Register dans `src/lib/sources/index.ts` (`ADAPTERS`).
4. Règle d'or : **pas de navigateur headless sur Vercel**. Privilégie RSS/API, sinon
   fetch + cheerio. Le reverse-engineering d'endpoint JSON vaut toujours mieux que Playwright.

## Modèles IA

Définis dans `src/lib/ai.ts` → `availableModels()` n'expose que les modèles dont la clé
env est présente. Pour ajouter un provider : ajoute une entrée dans la fonction. Le résumé
est généré à la demande (bouton "Résumer") puis stocké en base (`summary`, `hook`,
`summary_model`). Pas de résumé à l'ingestion (coût/latence).

## Conventions de code

- TypeScript strict, **zéro commentaire** sauf demande explicite.
- Pas d'emojis dans le code.
- Composants client : `'use client'` en première ligne.
- URLs de filtres : `?asset=BTC&asset=ETH&exchange=OKX&source=cryptopanic&q=...&summary=1`.
- Dates stockées en ms (integer), formatées via `src/lib/fmt.ts` (date-fns, locale fr).

## Sécurité

- Ne jamais commit `.env*` (sauf `.env.example`). Ne pas loguer de tokens.
- `/api/cron/refresh` vérifie `CRON_SECRET` (header `x-cron-secret` ou `?secret=`).

## Déploiement (Vercel)

1. Crée une DB Turso, mets `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` dans Vercel.
2. `npm run db:push` après chaque changement de schéma (ou via un script build).
3. Cron : Vercel Hobby est limité → le workflow `.github/workflows/refresh.yml`
   appelle `/api/cron/refresh` toutes les 15 min gratuitement.
4. Renseigne les clés IA voulues ; seuls les modèles avec clé apparaissent dans l'UI.
