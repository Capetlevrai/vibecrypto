import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { FaDiscord, FaGithub, FaTwitch, FaXTwitter, FaYoutube } from "react-icons/fa6";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibecrypto.org"),
  title: "VibeCrypto — Veille crypto",
  description:
    "Veille crypto multi-sources (Coinacademy, TodayOnChain, AskSurf, CryptoPanic) avec résumés IA. BTC, ETH, SOL, Hyperliquid, Bittensor, Morpho, Aave, Uniswap, Sky, pump.fun.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "VibeCrypto — Veille crypto",
    description:
      "Veille crypto multi-sources avec résumés IA en français.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-[var(--border)] px-4 py-5 font-mono text-[11px] text-[var(--muted)]">
          <div className="mx-auto flex w-full max-w-[112rem] flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 uppercase tracking-[0.14em]">
              <span>Vibe<span className="text-[var(--marker)]">Crypto</span></span>
              <span className="text-[var(--border)]">·</span>
              <span>news crypto multi-sources</span>
              <span className="text-[var(--border)]">·</span>
              <a
                href="https://x.com/capetlevrai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--foreground)]"
              >
                <FaXTwitter aria-hidden="true" className="text-[12px]" />
                Made by Capetlevrai
              </a>
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[var(--border)]/60 pt-4">
              <nav aria-label="Sites partenaires" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <a href="https://coinacademy.fr/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--foreground)]">
                  coinacademy.fr
                </a>
                <a href="https://crypto-buyback.xyz/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--foreground)]">
                  crypto-buyback.xyz
                </a>
                <a href="https://hypurrintel.xyz/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--foreground)]">
                  hypurrintel.xyz
                </a>
              </nav>

              <div className="flex items-center gap-3 sm:border-l sm:border-[var(--border)] sm:pl-5">
                <a href="https://discord.gg/VmBa7f9ZAt" target="_blank" rel="noopener noreferrer" aria-label="Discord" title="Discord" className="text-base transition-colors hover:text-[var(--foreground)]">
                  <FaDiscord aria-hidden="true" />
                </a>
                <a href="https://www.twitch.tv/capetlevrai" target="_blank" rel="noopener noreferrer" aria-label="Twitch" title="Twitch" className="text-base transition-colors hover:text-[var(--foreground)]">
                  <FaTwitch aria-hidden="true" />
                </a>
                <a href="https://github.com/Capetlevrai/vibecrypto/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className="text-base transition-colors hover:text-[var(--foreground)]">
                  <FaGithub aria-hidden="true" />
                </a>
                <a href="https://www.youtube.com/@CAPETCRYPTO" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube" className="text-base transition-colors hover:text-[var(--foreground)]">
                  <FaYoutube aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
