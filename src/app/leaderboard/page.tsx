import Link from "next/link";
import { getLeaderboard } from "@/lib/leaderboard";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-xs text-[var(--accent-200)]">Leaderboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
              Scoreboard wired for Supabase or fallback demo data
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-200)]">
              If `scores` and `profiles` exist in Supabase, this page reads the live table. Otherwise it falls back to
              local sample data so deployment previews still render cleanly.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
          >
            Back to round
          </Link>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-4 sm:p-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/8">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[var(--surface-850)]/80 text-xs uppercase tracking-[0.22em] text-[var(--ink-400)]">
              <tr>
                <th className="px-4 py-4">Rank</th>
                <th className="px-4 py-4">Player</th>
                <th className="px-4 py-4">Total score</th>
                <th className="px-4 py-4">Rounds</th>
                <th className="px-4 py-4">Best round</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={`${entry.rank}-${entry.username}`} className="border-t border-white/8 bg-[var(--surface-900)]/70">
                  <td className="px-4 py-4 font-mono text-sm text-[var(--accent-200)]">#{entry.rank}</td>
                  <td className="px-4 py-4 text-white">{entry.username}</td>
                  <td className="px-4 py-4 text-[var(--ink-200)]">{entry.totalScore.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[var(--ink-200)]">{entry.roundsPlayed}</td>
                  <td className="px-4 py-4 text-[var(--ink-200)]">{entry.bestRoundScore.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
