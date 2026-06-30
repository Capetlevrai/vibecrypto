export const ASSETS = [
  "BTC",
  "ETH",
  "SOL",
  "HYPE",
  "TAO",
  "MORPHO",
  "AAVE",
  "UNI",
  "SKY",
  "PUMP",
] as const;
export type Asset = (typeof ASSETS)[number];

export const ASSET_LABELS: Record<Asset, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  HYPE: "Hyperliquid",
  TAO: "Bittensor",
  MORPHO: "Morpho",
  AAVE: "Aave",
  UNI: "Uniswap",
  SKY: "Sky",
  PUMP: "pump.fun",
};

export const EXCHANGES = [
  "OKX",
  "BINANCE",
  "COINBASE",
  "KRAKEN",
  "BYBIT",
  "HYPERLIQUID",
] as const;
export type Exchange = (typeof EXCHANGES)[number];

export const EXCHANGE_LABELS: Record<Exchange, string> = {
  OKX: "OKX",
  BINANCE: "Binance",
  COINBASE: "Coinbase",
  KRAKEN: "Kraken",
  BYBIT: "Bybit",
  HYPERLIQUID: "Hyperliquid",
};

export const SOURCES = [
  "coinacademy",
  "todayonchain",
  "asksurf",
  "cryptopanic",
  "protos",
  "bankless",
  "helius",
  "taomedia",
  "taodaily",
  "hyperliquidr",
] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  coinacademy: "Coinacademy",
  todayonchain: "TodayOnChain",
  asksurf: "AskSurf Pulse",
  cryptopanic: "CryptoPanic",
  protos: "Protos",
  bankless: "Bankless",
  helius: "Helius",
  taomedia: "TAO Media",
  taodaily: "TAO Daily",
  hyperliquidr: "HyperliquidR",
};

export const SOURCE_COLORS: Record<Source, string> = {
  coinacademy: "#f7931a",
  todayonchain: "#6f7cff",
  asksurf: "#22d3ee",
  cryptopanic: "#a855f7",
  protos: "#ff4d4d",
  bankless: "#3b82f6",
  helius: "#e84142",
  taomedia: "#14b8a6",
  taodaily: "#10b981",
  hyperliquidr: "#50d2c1",
};

export interface Article {
  id: string;
  title: string;
  hook: string | null;
  excerpt: string | null;
  summary: string | null;
  summaryModel: string | null;
  summaryAt: number | null;
  url: string;
  imageUrl: string | null;
  source: Source;
  sourceName: string | null;
  publishedAt: number | null;
  fetchedAt: number;
  assets: string[];
  exchanges: string[];
  rawContent: string | null;
  score: number;
}
