import type { SourceAdapter } from "./types";
import { coinacademy } from "./coinacademy";
import { todayonchain } from "./todayonchain";
import { asksurf } from "./asksurf";
import { cryptopanic } from "./cryptopanic";

export const ADAPTERS: SourceAdapter[] = [
  coinacademy,
  todayonchain,
  asksurf,
  cryptopanic,
];

export function getAdapter(source: string): SourceAdapter | undefined {
  return ADAPTERS.find((a) => a.source === source);
}

export { coinacademy, todayonchain, asksurf, cryptopanic };
export * from "./types";
