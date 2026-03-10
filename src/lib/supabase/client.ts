import { createBrowserClient } from "@supabase/ssr";
import { appConfig } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!appConfig.supabaseReady) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(
    appConfig.supabaseUrl,
    appConfig.supabaseAnonKey,
  );
}
