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
  title: "HELIX-CHAIN: Autonomous CRISPR & DeSci Genomic Vault",
  description:
    "Autonomous bioinformatics and Web3 DeSci platform for real-time CRISPR Cas9 gene repair modeling, in-memory Solidity contract verification, and on-chain genomic vault proof anchoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#05070E] text-slate-100"
      >
        {children}
      </body>
    </html>
  );
}
