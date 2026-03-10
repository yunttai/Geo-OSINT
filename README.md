# GeoOSINT

Deploy-ready GeoGuessr-style MVP scaffold built with Next.js, Vercel, Supabase, and Google Street View.

## What is included

- Playable round flow with `GET /api/game/round` and `POST /api/game/guess`
- Google Maps JavaScript Street View panorama plus clickable guess map
- Supabase magic-link login page
- Optional Supabase score persistence and leaderboard page
- Signed round tokens so the client cannot forge score submissions
- Supabase SQL schema with RLS policies in [`supabase/schema.sql`](./supabase/schema.sql)

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Copy environment variables.

```bash
cp .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ROUND_TOKEN_SECRET`

4. Start the app.

```bash
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Open SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Authentication, enable email sign-in.
4. Add your local URL and Vercel URL to the redirect allow-list:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`

## Google Maps setup

1. Create a Google Cloud project with billing enabled.
2. Enable `Maps JavaScript API`.
3. Create a browser key and restrict it by HTTP referrer:
   - `http://localhost:3000/*`
   - `https://your-domain.vercel.app/*`
4. Put that key in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

Notes:

- This scaffold uses the JavaScript API because the gameplay needs an interactive Street View panorama.
- If you later add static screenshots or thumbnails, sign those URLs server-side instead of exposing an unrestricted key.

## Deployment

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add the same environment variables in Vercel project settings.
4. Deploy.

No custom `vercel.json` is required for this app.

## Verification

These commands passed on March 10, 2026:

```bash
npm run lint
npm run build
```
