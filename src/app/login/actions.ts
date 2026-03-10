"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { appConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthState = {
  status: "idle" | "success" | "error";
  message: string;
};

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function requestMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!appConfig.supabaseReady) {
    return {
      status: "error",
      message: "Add Supabase URL and anon key first. The form is wired, but the backend is not configured yet.",
    };
  }

  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  try {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") || appConfig.siteUrl;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "success",
      message: "Magic link sent. After the email callback, your score submissions can be persisted.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not reach Supabase. Verify env vars and redirect URL configuration.",
    };
  }
}
