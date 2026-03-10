"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/app/login/actions";

type AuthState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: AuthState = {
  status: "idle",
  message: "Sign in with Supabase magic link after you add the environment variables.",
};

export function AuthCard({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(requestMagicLink, initialState);

  return (
    <section className="glass-panel grid-panel rounded-[2rem] p-6">
      <div className="space-y-3">
        <p className="eyebrow text-xs text-[var(--accent-200)]">Auth</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
          Supabase magic-link login
        </h1>
        <p className="max-w-xl text-sm leading-7 text-[var(--ink-200)]">
          This page is wired for email login. If Supabase keys are missing, the form stays visible but
          will not issue real links.
        </p>
      </div>

      <form action={action} className="mt-8 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-[var(--ink-200)]">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-[var(--surface-900)]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--accent-400)]/50"
          />
        </label>
        <button
          type="submit"
          disabled={!enabled || pending}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-5 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--ink-400)]"
        >
          {pending ? "Sending..." : "Send magic link"}
        </button>
      </form>

      <p
        className={`mt-4 text-sm ${
          state.status === "error"
            ? "text-[var(--danger-300)]"
            : state.status === "success"
              ? "text-[var(--success-300)]"
              : "text-[var(--ink-400)]"
        }`}
      >
        {state.message}
      </p>
    </section>
  );
}
