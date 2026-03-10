import { NextResponse } from "next/server";
import { getRandomRound, toPublicRound } from "@/lib/game/sample-rounds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const excludedRoundIds = requestUrl.searchParams
    .get("exclude")
    ?.split(",")
    .filter(Boolean) ?? [];

  const round = getRandomRound(excludedRoundIds);

  return NextResponse.json({
    round: toPublicRound(round),
  });
}
