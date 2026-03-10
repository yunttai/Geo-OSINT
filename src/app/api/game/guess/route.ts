import { NextResponse } from "next/server";
import { z } from "zod";
import { appConfig } from "@/lib/env";
import { verifyRoundToken } from "@/lib/game/round-token";
import { scoreGuess } from "@/lib/game/scoring";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const guessSchema = z.object({
  token: z.string().min(1),
  guess: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  elapsedMs: z.number().int().min(0).max(15 * 60 * 1000),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = guessSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid guess payload." },
      { status: 400 },
    );
  }

  const verifiedRound = verifyRoundToken(parsed.data.token);

  if (!verifiedRound) {
    return NextResponse.json(
      { error: "Round token is invalid." },
      { status: 400 },
    );
  }

  const score = scoreGuess({
    answer: verifiedRound.position,
    guess: parsed.data.guess,
    elapsedMs: parsed.data.elapsedMs,
  });

  let savedToLeaderboard = false;

  if (appConfig.supabaseReady) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("guesses").insert({
          user_id: user.id,
          round_slug: verifiedRound.id,
          guess_lat: parsed.data.guess.lat,
          guess_lng: parsed.data.guess.lng,
          distance_km: Number(score.distanceKm.toFixed(3)),
          score: score.score,
          elapsed_ms: parsed.data.elapsedMs,
        });

        const { data: existingScore } = await supabase
          .from("scores")
          .select("user_id,total_score,rounds_played,best_round_score")
          .eq("user_id", user.id)
          .maybeSingle();

        const nextScore = {
          user_id: user.id,
          total_score: (existingScore?.total_score ?? 0) + score.score,
          rounds_played: (existingScore?.rounds_played ?? 0) + 1,
          best_round_score: Math.max(existingScore?.best_round_score ?? 0, score.score),
        };

        await supabase.from("scores").upsert(nextScore);
        savedToLeaderboard = true;
      }
    } catch {
      savedToLeaderboard = false;
    }
  }

  return NextResponse.json({
    result: {
      ...score,
      answer: {
        id: verifiedRound.id,
        country: verifiedRound.country,
        region: verifiedRound.region,
        locationLabel: verifiedRound.locationLabel,
        coordinates: verifiedRound.position,
      },
      guess: parsed.data.guess,
      savedToLeaderboard,
    },
  });
}
