import Link from "next/link";
import { GameConsole } from "@/components/game-console";
import { appConfig } from "@/lib/env";

const stackCards = [
  {
    title: "Frontend",
    value: "Next.js on Vercel",
    body: "App Router, preview deployments, and server routes for round creation plus scoring.",
  },
  {
    title: "Backend",
    value: "Supabase",
    body: "Postgres, Auth, and optional score persistence with row-level security from day one.",
  },
  {
    title: "Imagery",
    value: "Google Street View",
    body: "Maps JavaScript API for rotatable panorama gameplay, not just a static screenshot.",
  },
];

const deployChecklist = [
  "Create a Supabase project and copy URL plus anon key into `.env.local`.",
  "Enable Maps JavaScript API in Google Cloud and add a browser-restricted key.",
  "Set `ROUND_TOKEN_SECRET` before production so score submissions cannot be forged.",
  "Push to GitHub and import the repo into Vercel for preview deployments.",
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="glass-panel grid-panel rounded-[2.25rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">Service-ready MVP</p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              GeoGuessr-style deployment starter without the usual stack drift.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--ink-200)] sm:text-lg">
              This scaffold is built for the exact path you described: Next.js frontend, Vercel deployment,
              Supabase for auth plus storage, and Google Street View for the actual round view. It ships with a
              playable demo round flow, signed score submissions, and a Supabase schema you can apply today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#play"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-5 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)]"
              >
                Open the live round
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
              >
                View leaderboard
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-[var(--surface-900)]/76 p-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">Runtime</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Google Maps</p>
                <p className="stat-value mt-2 text-2xl text-white">
                  {appConfig.googleMapsReady ? "Configured" : "Key missing"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Supabase</p>
                <p className="stat-value mt-2 text-2xl text-white">
                  {appConfig.supabaseReady ? "Configured" : "Keys missing"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Deployment</p>
                <p className="stat-value mt-2 text-2xl text-white">Vercel-ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {stackCards.map((card) => (
          <article key={card.title} className="glass-panel rounded-[1.75rem] p-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">{card.title}</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
              {card.value}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-200)]">{card.body}</p>
          </article>
        ))}
      </section>

      <section id="play" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-xs text-[var(--accent-200)]">Playable Slice</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              Round generation, scoring, and optional leaderboard persistence
            </h2>
          </div>
        </div>
        <GameConsole
          googleMapsApiKey={appConfig.googleMapsApiKey}
          googleMapsEnabled={appConfig.googleMapsReady}
          supabaseEnabled={appConfig.supabaseReady}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="glass-panel rounded-[2rem] p-6">
          <p className="eyebrow text-xs text-[var(--accent-200)]">Deploy Flow</p>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-200)]">
            {deployChecklist.map((item) => (
              <li key={item} className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-900)]/74 px-4 py-3">
                {item}
              </li>
            ))}
          </ol>
        </article>

        <article className="glass-panel rounded-[2rem] p-6">
          <p className="eyebrow text-xs text-[var(--accent-200)]">Architecture Notes</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ink-200)]">
            <p>
              `GET /api/game/round` returns a signed round payload. `POST /api/game/guess` verifies that payload,
              computes haversine distance, and optionally writes the score into Supabase when a logged-in user is
              present.
            </p>
            <p>
              The demo uses sample round seeds in code so you can deploy immediately, then swap the seed source for a
              Supabase table or an Edge Function later.
            </p>
            <p>
              This is intentionally single-source. If Google policy or cost becomes a real problem, add a provider
              abstraction after the MVP proves its retention.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
