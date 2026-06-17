# VibeCrypto

Veille crypto multi-sources agrégée avec résumés IA en français, conçue pour la
création de contenu (Twitter, YouTube, Twitch, presse). Next.js 16 + Turso +
Vercel AI SDK (multi-modèles).

## Sources

| Source | Méthode | Statut |
|---|---|---|
| Coinacademy | RSS (`/feed/`) | actif |
| TodayOnChain | Scraping HTML (`cheerio`) | actif |
| AskSurf Pulse | — | **désactivé** : le rapport Cryptopulse n'est pas exposé en HTML statique (prompts d'exemple uniquement). Voir `src/lib/sources/asksurf.ts` |
| CryptoPanic | API officielle (token requis) | actif si `CRYPTOPANIC_TOKEN` défini |

**Aucune source ne nécessite de navigateur headless** → déploiement Vercel simple.

## Projets suivis

BTC, ETH, SOL, Hyperliquid (HYPE), Bittensor (TAO), Morpho, Aave, Uniswap (UNI),
Sky, pump.fun. Exchanges : OKX, Binance, Coinbase, Kraken, Bybit, Hyperliquid.

## Démarrage rapide

```bash
npm install
cp .env.example .env.local      # renseigne au moins CRON_SECRET + une clé IA
npm run db:push                 # crée le schéma (local.db par défaut)
npm run refresh                 # 1ère ingestion
npm run dev                     # http://localhost:3000
```

Chaque article affiche : **titre, accroche, date/heure, lien direct, et un résumé
IA en 2 paragraphes** (généré à la demande via le bouton « Résumer »).

## Variables d'environnement

Voir `.env.example`. L'app n'expose que les modèles IA dont la clé est présente
(GLM via Z.AI/OpenRouter, Grok via xAI, Claude, OpenAI…).

## Déploiement (Vercel)

1. Crée une DB **Turso**, renseigne `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
2. `npm run db:push` après chaque modif de schéma.
3. Cron gratuit : le workflow `.github/workflows/refresh.yml` appelle
   `/api/cron/refresh` toutes les 15 min. Configure les secrets GitHub :
   `REFRESH_URL` (= `https://ton-domaine/api/cron/refresh`) et `CRON_SECRET`.
4. Renseigne les clés IA souhaitées dans Vercel.

## Multi-agent

Piloté par 3 agents : GLM 5.2 (opencode/OMP), Claude Code (`CLAUDE.md`), Codex
(`AGENTS.md`). Voir ces fichiers pour les conventions.

## À propos de X / Grok

L'abonnement Supergrok ne donne **pas** d'accès API. Pour le signal Twitter, on
récupère le bruit via les agrégateurs (CryptoPanic/TodayOnChain). Pour les résumés
IA, l'API **xAI Grok** (`XAI_API_KEY`) est prise en charge comme n'importe quel modèle.

## Licence

MIT.
