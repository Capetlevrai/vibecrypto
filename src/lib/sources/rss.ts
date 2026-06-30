import Parser from "rss-parser";

const DEFAULT_UA =
  "VibeCrypto/1.0 (+https://github.com/Capetlevrai/vibecrypto)";

export function makeParser(): Parser {
  return new Parser({
    timeout: 12000,
    headers: { "User-Agent": DEFAULT_UA },
    customFields: {
      item: [
        ["media:content", "media:content", { keepArray: true }],
        ["media:thumbnail", "media:thumbnail", { keepArray: true }],
        ["content:encoded", "contentEncoded"],
      ],
    },
  });
}

function absolutize(src: string, base?: string): string | undefined {
  const trimmed = src.trim();
  if (!trimmed) return undefined;
  if (!base) return trimmed;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return trimmed;
  }
}

function mediaUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  for (const entry of arr) {
    const obj = entry as { $?: { url?: string; medium?: string; type?: string }; url?: string };
    const url = obj.$?.url ?? obj.url;
    if (!url) continue;
    const medium = obj.$?.medium;
    const type = obj.$?.type;
    if (medium && medium !== "image") continue;
    if (type && !type.startsWith("image")) continue;
    return url;
  }
  return undefined;
}

const IMG_BLOCKLIST =
  /s\.w\.org|\/emoji\/|wp-smiley|^data:|gravatar|\/avatar|spacer|pixel\.|1x1|feedburner|doubleclick/i;

function firstContentImage(html: string): string | undefined {
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const src = match[1];
    if (!src || IMG_BLOCKLIST.test(src)) continue;
    return src;
  }
  return undefined;
}

export function pickImage(
  item: Record<string, unknown>,
  opts?: { baseUrl?: string },
): string | undefined {
  const base = opts?.baseUrl;
  const fromMedia =
    mediaUrl(item["media:content"]) ?? mediaUrl(item["media:thumbnail"]);
  if (fromMedia) return absolutize(fromMedia, base);

  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url && (!enclosure.type || enclosure.type.startsWith("image"))) {
    return absolutize(enclosure.url, base);
  }

  const html = String(item.contentEncoded ?? item.content ?? "");
  const fromHtml = firstContentImage(html);
  if (fromHtml) return absolutize(fromHtml, base);

  return undefined;
}
