# VibeCrypto

[VibeCrypto](https://vibecrypto.org) est un fil de news crypto multi-sources avec
filtrage par actif, exchange et source, recherche plein texte et résumés IA en
français. Le projet est conçu pour alimenter rapidement la création de contenu
sur X, YouTube, Twitch et la presse.

## Fonctionnalités

- agrégation autonome de huit sources sans navigateur headless ;
- vue liste compacte et vue grille ;
- filtres par actif, exchange et source ;
- recherche dans les titres et résumés ;
- titres, accroches et résumés IA en français ;
- conservation du contenu original ;
- récupération des images éditoriales, notamment pour Helius ;
- lien vers la source finale pour les articles relayés par TodayOnChain ;
- déduplication par URL normalisée ;
- mise à jour automatique toutes les 15 minutes avec reprise du backlog de
  traduction lors des exécutions suivantes.

## Sources

| Source | Méthode |
|---|---|
| Coinacademy | RSS |
| TodayOnChain | HTML avec résolution de la source finale |
| Protos | RSS |
| Bankless | RSS |
| Helius | RSS et métadonnées Open Graph |
| TAO Media | RSS |
| TAO Daily | RSS |
| HyperliquidR | RSS |

Aucune source ne nécessite Playwright ou un navigateur headless, ce qui garde
l'ingestion compatible avec Vercel.

## Suivi

Actifs : Bitcoin, Ethereum, Solana, Hyperliquid, Bittensor, Morpho, Aave,
Uniswap, Sky et pump.fun.

Exchanges : OKX, Binance, Coinbase, Kraken, Bybit et Hyperliquid.

## Stack

- Next.js 16 App Router, React 19 et TypeScript strict ;
- Tailwind CSS 4 ;
- Drizzle ORM avec libSQL/Turso ;
- Vercel AI SDK 6 avec plusieurs fournisseurs IA ;
- RSS Parser, Cheerio et `fetch` natif ;
- Vercel pour l'application et GitHub Actions pour l'ingestion planifiée.

## Démarrage local

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run refresh
npm run dev
```

L'application est alors disponible sur [http://localhost:3000](http://localhost:3000).

## Commandes

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run db:push
npm run refresh
npm run refresh -- helius
```

## Configuration

Les variables disponibles sont documentées dans `.env.example`. Les principales
sont :

- `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` pour la base de production ;
- `CRON_SECRET` pour protéger `/api/cron/refresh` ;
- `AUTO_SUMMARIZE`, `AUTO_SUMMARIZE_MAX` et
  `AUTO_SUMMARIZE_CONCURRENCY` pour le backlog de résumés ;
- les clés Z.AI, OpenRouter, xAI, Anthropic, OpenAI ou DeepSeek selon le modèle
  utilisé.

Seuls les modèles dont la clé est configurée sont exposés par l'application. Si
un lot atteint une limite fournisseur, les articles non traités restent dans le
backlog et sont repris automatiquement.

## Ingestion autonome

Le workflow `.github/workflows/refresh.yml` appelle l'API de production toutes
les 15 minutes. Un cron Vercel quotidien reste configuré comme solution de
secours.

Secrets GitHub requis :

- `REFRESH_URL` : `https://vibecrypto.org/api/cron/refresh` ;
- `CRON_SECRET` : même valeur que dans Vercel.

Le pipeline récupère les sources en parallèle, tague les articles, met à jour
les URL finales, insère les nouveautés puis traite le backlog français. La
documentation détaillée est disponible dans [`docs/INGESTION.md`](docs/INGESTION.md).

## Déploiement

```bash
npm run typecheck
npm run lint
npm run build
npx vercel --prod
```

Après une modification du schéma Drizzle, exécuter `npm run db:push` contre la
base Turso avant le déploiement applicatif.

## Liens

- Site : [vibecrypto.org](https://vibecrypto.org)
- X : [@capetlevrai](https://x.com/capetlevrai)
- YouTube : [CAPETCRYPTO](https://www.youtube.com/@CAPETCRYPTO)
- Twitch : [capetlevrai](https://www.twitch.tv/capetlevrai)
- Discord : [VibeCrypto](https://discord.gg/VmBa7f9ZAt)
- CoinAcademy : [coinacademy.fr](https://coinacademy.fr/)
- Crypto Buyback : [crypto-buyback.xyz](https://crypto-buyback.xyz/)
- HypurrIntel : [hypurrintel.xyz](https://hypurrintel.xyz/)

## Licence

MIT.
