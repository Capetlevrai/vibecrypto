# CLAUDE.md — instructions pour Claude Code

> La source de vérité du projet est **`AGENTS.md`** (à la racine). Lis-le d'abord.
> Ce fichier n'ajoute que les notes spécifiques à Claude Code.

## Rôle de Claude Code dans le workflow multi-agent

Ce dépôt est édité par 3 agents : **GLM 5.2** (opencode / OMP), **Claude Code** (toi),
et **Codex** (AGENTS.md). Pour éviter les conflits :

- Privilégie les **changements ciblés et idempotents** (édite, ne réécris pas tout).
- Avant une modif de schéma (`src/lib/db/schema.ts`), préviens qu'il faut relancer
  `npm run db:push`.
- Après toute modif TypeScript : lance `npm run typecheck` puis `npm run lint`.

## Priorités techniques (pièges connus)

- **Next.js 16** : `params`/`searchParams`/`cookies`/`headers` sont **async**. Toujours
  `await`. Helpers globaux `PageProps<'/route'>` et `RouteContext<'/route'>`.
- Pas de `next lint` (supprimé). Utilise `npm run lint` (eslint direct).
- `cacheComponents` est OFF → toute route qui lit la DB doit exporter
  `export const dynamic = "force-dynamic"`.
- Les adaptateurs de sources (`src/lib/sources/*`) ne doivent **jamais** utiliser de
  navigateur headless (Vercel). RSS/API/cheerio/fetch + reverse-engineer JSON uniquement.
- AskSurf se scrape via le flux RSC (`self.__next_f.push`) — ne pas casser ce parseur.

## Style

- Respecte ce qui existe (imports `@/`, `cn()` de `src/lib/cn.ts`, tokens CSS dans
  `globals.css` : `var(--accent)` etc.).
- Zéro commentaire, zéro emoji, `'use client'` en première ligne des composants client.
- Résumés IA : format JSON `{ hook, summary }` via `generateObject` (déjà câblé dans
  `src/lib/ai.ts`). Ne pas changer le contrat du schema sans mettre à jour la DB.

## Tests / vérifs

```bash
npm run typecheck   # doit passer
npm run lint        # doit passer
npm run refresh     # ingestion manuelle (vérifie que les sources ramènent des data)
npm run dev         # http://localhost:3000
```
