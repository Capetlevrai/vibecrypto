import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="border-t border-[var(--border)]/60 px-4 py-5 text-center text-xs text-[var(--muted)]">
          Vibe<span className="text-[var(--accent)]">Crypto</span> · veille crypto multi-sources
        </footer>
      </body>
    </html>
  );
}
