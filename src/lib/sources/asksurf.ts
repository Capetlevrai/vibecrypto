import type { RawArticle, SourceAdapter } from "./types";

// ⚠️ Source AskSurf /pulse — ÉTAT DES LIEUX (juin 2026)
//
// La page /pulse est une app Next.js (App Router) qui N'expose PAS le rapport
// Cryptopulse dans le HTML statique. Le flux RSC (`self.__next_f.push`) ne contient
// que des PROMPTS D'EXEMPLE (« Build me a crypto market dashboard… ») et du
// contenu marketing/sample — pas un digest live. Le vrai rapport est généré à la
// demande (côté client / endpoint authentifié), donc inaccessible par fetch simple.
//
// Conséquence : sur Vercel (pas de navigateur headless), on ne peut pas récupérer
// le Cryptopulse. L'adaptateur retourne donc [] pour ne pas polluer le fil avec
// des prompts d'exemple.
//
// Pistes pour réactiver plus tard :
//   1. Demander/chercher une API officielle AskSurf.
//   2. Worker sur VPS (Playwright) qui génère le rapport et l'écrit en base.
//   3. Demander à AskSurf un flux RSS/JSON du Cryptopulse.

export const asksurf: SourceAdapter = {
  source: "asksurf",
  label: "AskSurf Pulse",
  async fetch(): Promise<RawArticle[]> {
    return [];
  },
};
