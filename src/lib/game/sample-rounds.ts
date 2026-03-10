import { generatedRoundSeeds } from "@/lib/game/generated-round-seeds";
import type { PublicRound, RoundSeed } from "@/types/game";

export const sampleRounds: RoundSeed[] = generatedRoundSeeds;

export function getRandomRound(excludedRoundIds: string[] = []) {
  const pool = sampleRounds.filter((round) => !excludedRoundIds.includes(round.id));

  if (pool.length === 0) {
    return sampleRounds[0];
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function toPublicRound(round: RoundSeed): PublicRound {
  return {
    id: round.id,
    clue: round.clue,
    country: round.country,
    region: round.region,
    locationLabel: round.locationLabel,
    difficulty: round.difficulty,
    position: round.position,
    pov: round.pov,
  };
}
