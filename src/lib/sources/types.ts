import type { Source } from "@/lib/types";

export interface RawArticle {
  title: string;
  url: string;
  finalUrl?: string;
  imageUrl?: string;
  excerpt?: string;
  rawContent?: string;
  publishedAt?: number;
  source: Source;
  sourceName?: string;
}

export interface SourceAdapter {
  source: Source;
  label: string;
  fetch(): Promise<RawArticle[]>;
}
