import type { Metadata } from "next";
import Link from "next/link";
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
  title: "GeoOSINT",
  description: "Deploy-ready GeoGuessr-style MVP built with Next.js, Vercel, Supabase, and Google Street View.",
};

const navigation = [
  { href: "/", label: "Play" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/login", label: "Login" },
];

const statusTags = [
  "Next.js App Router",
  "Vercel-ready",
  "Supabase Auth",
  "Google Street View",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} bg-[var(--surface-950)] text-[var(--ink-050)] antialiased`}
      >
        <div className="page-shell">
          <div className="ambient ambient-top" />
          <div className="ambient ambient-bottom" />
          <div className="noise-overlay" />
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-10">
            <header className="sticky top-0 z-20 mb-8 rounded-full border border-white/10 bg-[rgba(8,11,18,0.72)] px-4 py-3 backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-3 rounded-full border border-[var(--accent-400)]/30 bg-[var(--surface-900)]/80 px-4 py-2 text-sm font-semibold tracking-[0.28em] text-[var(--accent-200)] uppercase"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--accent-300)] shadow-[0_0_20px_var(--accent-300)]" />
                    GeoOSINT
                  </Link>
                  <p className="hidden text-sm text-[var(--ink-400)] md:block">
                    Deployable MVP for a map-guessing game.
                  </p>
                </div>
                <nav className="flex flex-wrap items-center gap-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {statusTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/8 bg-white/4 px-3 py-1 font-mono text-[11px] tracking-[0.2em] text-[var(--ink-400)] uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
