import { appConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types/game";

const fallbackLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    username: "signal-chaser",
    totalScore: 43210,
    roundsPlayed: 11,
    bestRoundScore: 4920,
  },
  {
    rank: 2,
    username: "tile-reader",
    totalScore: 38840,
    roundsPlayed: 10,
    bestRoundScore: 4811,
  },
  {
    rank: 3,
    username: "road-sign-savant",
    totalScore: 34250,
    roundsPlayed: 9,
    bestRoundScore: 4724,
  },
];

type ScoreRow = {
  total_score: number;
  rounds_played: number;
  best_round_score: number;
  profiles:
    | {
        username: string | null;
      }
    | {
        username: string | null;
      }[]
    | null;
};

export async function getLeaderboard() {
  if (!appConfig.supabaseReady) {
    return fallbackLeaderboard;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("scores")
      .select("total_score,rounds_played,best_round_score,profiles(username)")
      .order("total_score", { ascending: false })
      .limit(25);

    if (error || !data?.length) {
      return fallbackLeaderboard;
    }

    return (data as ScoreRow[]).map((row, index) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      return {
        rank: index + 1,
        username: profile?.username || `player-${index + 1}`,
        totalScore: row.total_score,
        roundsPlayed: row.rounds_played,
        bestRoundScore: row.best_round_score,
      };
    });
  } catch {
    return fallbackLeaderboard;
  }
}
