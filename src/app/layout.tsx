import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
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
  title: "VibeCrypto — Veille crypto",
  description:
    "Veille crypto multi-sources (Coinacademy, TodayOnChain, AskSurf, CryptoPanic) avec résumés IA. BTC, ETH, SOL, Hyperliquid, Bittensor, Morpho, Aave, Uniswap, Sky, pump.fun.",
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
        <footer className="mt-auto border-t border-[var(--border)] px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Vibe<span className="text-[var(--marker)]">Crypto</span>
          <span className="mx-2 text-[var(--border)]">·</span>
          dépêches crypto multi-sources
        </footer>
      </body>
    </html>
  );
}
