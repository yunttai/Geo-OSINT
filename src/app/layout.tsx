import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MJSEC Geo-OSINT",
  description: "Street View guessing game with a simple start, play, and result flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} bg-[var(--surface-950)] text-[var(--ink-050)] antialiased`}
      >
        <div className="page-shell">
          <div className="ambient ambient-top" />
          <div className="ambient ambient-bottom" />
          <div className="noise-overlay" />
          <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-6 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
