# Service d'ingestion (veille news)

> Objectif : récupérer régulièrement les nouvelles news crypto depuis plusieurs
> sources, les dédupliquer, les taguer (assets/exchanges) et générer un résumé FR.
> Conçu pour évoluer : ajouter une source = ajouter un fichier.

## Vue d'ensemble du flux

```
GitHub Actions (cron /15min)
        │  POST  x-cron-secret
        ▼
/api/cron/refresh ──► runIngest()  (src/lib/ingest.ts)
        │
        ├─ 1. fetch parallèle de tous les adaptateurs   (src/lib/sources/*)
        ├─ 2. tag assets/exchanges                       (src/lib/tagging.ts)
        ├─ 3. insertion idempotente (onConflict urlHash) (src/lib/db)
        ├─ 4. résumé FR auto des nouveaux articles        (src/lib/summarize-batch.ts)
        └─ 5. maj meta.lastRefresh
```

Le même `runIngest()` est appelé en local par `npm run refresh`
(`src/scripts/refresh.ts`, qui charge `.env.local`).

## Modules

| Fichier | Rôle |
|---------|------|
| `src/lib/sources/types.ts` | Contrats `RawArticle` et `SourceAdapter`. |
| `src/lib/sources/*.ts` | Un adaptateur par source. Expose `{ source, label, fetch() }`. |
| `src/lib/sources/index.ts` | Registre `ADAPTERS` + `getAdapter()`. |
| `src/lib/tagging.ts` | Détection assets/exchanges par regex bornées. |
| `src/lib/ingest.ts` | Orchestrateur : fetch + tag + dedup + insert + résumé. |
| `src/lib/summarize-batch.ts` | Résumé FR en lot des nouveaux articles (garde-fous). |
| `src/lib/config.ts` | Lecture centralisée des flags d'env. |
| `src/app/api/cron/refresh/route.ts` | Endpoint HTTP (GET/POST), protégé par `CRON_SECRET`. |

## Dédoublonnage

Clé = `urlHash` = SHA1 de l'URL normalisée (host + path, sans slash final, lowercased).
L'insert utilise `onConflictDoNothing({ target: urlHash })` → relancer l'ingestion
est sûr et idempotent. (Limite connue : deux sources publiant la même news sous des
URL différentes créent deux entrées. Dédup par similarité de titre = amélioration future.)

## Résumé FR automatique

À chaque run, après insertion, `summarizePending()` résume en français les articles
**sans résumé** (backlog). Garde-fous (coût IA maîtrisé) :

- **plafonne** à `AUTO_SUMMARIZE_MAX` articles par run ;
- **priorise** les articles à fort `score` (assets/exchanges suivis) puis les plus récents ;
- **concurrence limitée** (`AUTO_SUMMARIZE_CONCURRENCY`) ;
- **auto-réparant** : si un run est interrompu (timeout), le suivant reprend le reste ;
- désactivable via `AUTO_SUMMARIZE=0`.

Le résumé est stocké en base (`summary`, `hook`, `summary_model`, `summary_at`).
Le texte original (`title`, `excerpt`, `raw_content`) est toujours conservé.

### Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `AUTO_SUMMARIZE` | `1` | Active le résumé auto à l'ingestion. |
| `AUTO_SUMMARIZE_MAX` | `12` | Nb max d'articles résumés par run. |
| `AUTO_SUMMARIZE_CONCURRENCY` | `3` | Appels IA simultanés. |
| `AUTO_SUMMARIZE_MODEL` | (1er dispo) | Id du modèle (cf. `src/lib/ai.ts`). |
| `CRON_SECRET` | — | Secret requis en prod pour `/api/cron/refresh`. |

Les clés IA (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `ZAI_API_KEY`, …) déterminent
quels modèles sont disponibles. Sans aucune clé, le résumé auto est ignoré.

## Ajouter une source

1. Créer `src/lib/sources/<nom>.ts` exportant un `SourceAdapter`.
   - Règle d'or : **pas de navigateur headless** (Vercel). RSS > API JSON > cheerio.
2. Ajouter la valeur au type `Source` + `SOURCE_LABELS`/`SOURCE_COLORS` dans `src/lib/types.ts`.
3. Enregistrer dans `ADAPTERS` (`src/lib/sources/index.ts`).
4. `npm run refresh <nom>` pour tester une seule source.

Un échec d'une source n'impacte pas les autres (`Promise.allSettled`), l'erreur est
remontée par source dans le résultat (`perSource[source].error`).

## Tester

```bash
npm run refresh                 # toutes les sources
npm run refresh coinacademy     # une seule source
curl -X POST localhost:3000/api/cron/refresh   # via l'endpoint (dev: pas de secret requis)
```
