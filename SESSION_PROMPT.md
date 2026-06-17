# Prompt de démarrage — VibeCrypto (session propre)

> Copie-colle tout le bloc ci-dessous dans une nouvelle session.

---

Je travaille sur **VibeCrypto**, un projet existant et fonctionnel de veille crypto.

## Contexte du projet

- **Repo GitHub** : https://github.com/Capetlevrai/vibecrypto
- **Chemin local** : `C:\Users\Capet9800X3D\Desktop\Cryptovibe`
- **Stack** : Next.js 16 (App Router, Turbopack) + React 19.2 + TypeScript strict + Tailwind CSS v4 + Drizzle ORM + Turso (libSQL) + Vercel AI SDK v6
- **Lis `AGENTS.md` et `CLAUDE.md` à la racine** avant d'écrire du code (conventions, pièges Next 16, architecture).

## Ce qui est déjà fait et fonctionne

- **4 sources** : Coinacademy (RSS), TodayOnChain (scraping HTML cheerio), CryptoPanic (API officielle, token requis), AskSurf (désactivée — le rapport n'est pas en HTML statique)
- **Ingestion** : `npm run refresh` → fetch + tag assets/exchanges + dédup idempotente par hash URL → table `articles` (Turso/libSQL, dev = `local.db`)
- **Dashboard** (`/`) : filtres assets/exchanges/sources + recherche + cartes avec **image, titre, accroche, date+heure, lien direct, résumé IA**
- **Page détail** (`/item/[id]`) : contenu complet + lien source
- **Résumés IA multi-modèles** : bouton « Résumer » sur chaque carte → `generateObject` → hook (1 phrase) + summary (2 paragraphes en français), stocké en base
- **Système de langue** : sélecteur drapeau 🌐 (à gauche du bouton Actualiser) → traduit titres + accroches en batch chunké par 20, cache localStorage, 7 langues
- **Cron** : `/api/cron/refresh` (GET+POST, protégé par `CRON_SECRET`) + GitHub Actions toutes les 15 min

## Configuration IA actuelle (.env.local)

```
CRON_SECRET=dev-local
DEEPSEEK_API_KEY=sk-d4...  ← trouvé dans ~/.local/share/opencode/auth.json, FONCTIONNE
DEEPSEEK_MODEL=deepseek-chat
# ZAI_API_KEY=5cd6a...  ← valide mais solde insuffisant, commenté
```

Providers supportés dans `src/lib/ai.ts` : ZAI (GLM), OpenRouter, xAI (Grok), Anthropic, OpenAI, **DeepSeek**.
Seuls les modèles dont la clé est présente apparaissent dans l'UI.

## Commandes

```bash
npm run dev          # serveur dev (http://localhost:3000)
npm run build        # build prod (Turbopack)
npm run typecheck    # tsc --noEmit ← après chaque modif TS
npm run lint         # eslint
npm run db:push      # pousse le schéma Drizzle vers la DB
npm run refresh      # ingestion manuelle (lit .env.local)
```

## Ce que je veux faire maintenant

[DESCRIS ICI TA DEMANDE — ex : "ajoute une source RSS", "déploie sur Vercel", "ajoute l'auth", "corrige le bug X", etc.]

## Règles importantes

- **Next.js 16** : `params`/`searchParams`/`cookies`/`headers` sont **async** (`await` obligatoire). Helpers globaux `PageProps<'/route'>` et `RouteContext<'/route'>`. Pas de `next lint` (utiliser `eslint`). `cacheComponents` OFF → `export const dynamic = "force-dynamic"` sur les routes DB.
- **Zéro commentaire**, zéro emoji dans le code. `'use client'` en première ligne des composants client.
- Imports en `@/`, helper `cn()` de `src/lib/cn.ts`, tokens CSS dans `globals.css` (`var(--accent)` etc.).
- **Sécurité** : ne jamais commit `.env*` (sauf `.env.example`). Ne pas loguer de tokens.
- Après toute modif TypeScript : `npm run typecheck` + `npm run lint`.
