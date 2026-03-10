import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { appConfig } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-xs text-[var(--accent-200)]">Access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
          Login is optional for the demo, required for persistent scores
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-200)]">
          Anonymous visitors can play rounds. Signed-in users can save guesses to Supabase and show up on the
          leaderboard once the database schema is applied.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
          >
            Back to game
          </Link>
        </div>
      </section>

      <AuthCard enabled={appConfig.supabaseReady} />
    </div>
  );
}
