const publicEnv = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const appConfig = {
  ...publicEnv,
  googleMapsReady: Boolean(publicEnv.googleMapsApiKey),
  supabaseReady: Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey),
};

export function getRoundTokenSecret() {
  return process.env.ROUND_TOKEN_SECRET || "dev-round-secret-change-me";
}

export function hasSupabaseServerKeys() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
