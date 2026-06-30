import { ASSETS, EXCHANGES } from "./types";

interface Pattern {
  tag: string;
  label: string;
  re: RegExp;
}

// Patterns à base de regex avec bornes de mot pour limiter les faux positifs.
export const ASSET_PATTERNS: Pattern[] = [
  { tag: "BTC", label: "Bitcoin", re: /\b(bitcoin|btc)\b/i },
  { tag: "ETH", label: "Ethereum", re: /\b(ethereum|\beth\b|ether(?:eum)?|vitalik)\b/i },
  { tag: "SOL", label: "Solana", re: /\b(solana|solana labs)\b/i },
  { tag: "HYPE", label: "Hyperliquid", re: /(\bhyperliquid\b|\$hype\b|\bhype token\b|\btoken hype\b)/i },
  { tag: "TAO", label: "Bittensor", re: /\b(bittensor|\btao\b)\b/i },
  { tag: "MORPHO", label: "Morpho", re: /\b(morpho)\b/i },
  { tag: "AAVE", label: "Aave", re: /\b(aave)\b/i },
  { tag: "UNI", label: "Uniswap", re: /\b(uniswap|uni token|uniswap labs)\b/i },
  { tag: "SKY", label: "Sky", re: /\b(\bsky\b protocol|usds|savings usds|makerdao|maker dao|endgame)\b/i },
  { tag: "PUMP", label: "pump.fun", re: /\b(pump\.fun|pumpfun|pump fun)\b/i },
];

export const EXCHANGE_PATTERNS: Pattern[] = [
  { tag: "OKX", label: "OKX", re: /\b(okx)\b/i },
  { tag: "BINANCE", label: "Binance", re: /\b(binance|cz binance|bnb chain)\b/i },
  { tag: "COINBASE", label: "Coinbase", re: /\b(coinbase|base chain|\bbase\b l2)\b/i },
  { tag: "KRAKEN", label: "Kraken", re: /\b(kraken)\b/i },
  { tag: "BYBIT", label: "Bybit", re: /\b(bybit)\b/i },
  { tag: "HYPERLIQUID", label: "Hyperliquid", re: /\b(hyperliquid)\b/i },
];

export function tagText(...parts: Array<string | null | undefined>) {
  const text = parts.filter(Boolean).join(" \n ");
  const assets = ASSET_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.tag);
  const exchanges = EXCHANGE_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.tag);
  return {
    assets: ASSETS.filter((a) => assets.includes(a)),
    exchanges: EXCHANGES.filter((e) => exchanges.includes(e)),
  };
}
