import type { SourceAdapter } from "./types";
import { coinacademy } from "./coinacademy";
import { todayonchain } from "./todayonchain";
import { protos } from "./protos";
import { bankless } from "./bankless";
import { helius } from "./helius";
import { taomedia } from "./taomedia";
import { taodaily } from "./taodaily";
import { hyperliquidr } from "./hyperliquidr";

export const ADAPTERS: SourceAdapter[] = [
  coinacademy,
  todayonchain,
  protos,
  bankless,
  helius,
  taomedia,
  taodaily,
  hyperliquidr,
];

export function getAdapter(source: string): SourceAdapter | undefined {
  return ADAPTERS.find((a) => a.source === source);
}

export {
  coinacademy,
  todayonchain,
  protos,
  bankless,
  helius,
  taomedia,
  taodaily,
  hyperliquidr,
};
export * from "./types";
