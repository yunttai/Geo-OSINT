import { createRoundToken } from "@/lib/game/round-token";
import type { PublicRound, RoundSeed } from "@/types/game";

export const sampleRounds: RoundSeed[] = [
  {
    id: "tokyo-shibuya",
    clue: "Dense signage, overhead utilities, and a lot of visual noise. Crosswalk discipline helps.",
    country: "Japan",
    region: "Shibuya, Tokyo",
    locationLabel: "Shibuya side street",
    difficulty: "easy",
    position: { lat: 35.65943, lng: 139.70054 },
    pov: { heading: 118, pitch: 1, zoom: 1 },
  },
  {
    id: "lisbon-alfama",
    clue: "Narrow lanes, warm tile tones, and hilly streets that often bend toward the river.",
    country: "Portugal",
    region: "Alfama, Lisbon",
    locationLabel: "Alfama hillside lane",
    difficulty: "medium",
    position: { lat: 38.71189, lng: -9.12952 },
    pov: { heading: 214, pitch: 2, zoom: 1 },
  },
  {
    id: "rome-trastevere",
    clue: "Old masonry, tight streets, and scooters everywhere. European plates but southern warmth.",
    country: "Italy",
    region: "Trastevere, Rome",
    locationLabel: "Trastevere neighborhood street",
    difficulty: "medium",
    position: { lat: 41.88967, lng: 12.46905 },
    pov: { heading: 302, pitch: 1, zoom: 1 },
  },
  {
    id: "sydney-newtown",
    clue: "Low-rise storefronts, left-side driving, and a lot of bright street art.",
    country: "Australia",
    region: "Newtown, Sydney",
    locationLabel: "King Street area",
    difficulty: "easy",
    position: { lat: -33.89809, lng: 151.17444 },
    pov: { heading: 22, pitch: 0, zoom: 1 },
  },
  {
    id: "mexico-city-roma",
    clue: "Urban grid, lots of trees, and a mix of historic apartment blocks with modern storefronts.",
    country: "Mexico",
    region: "Roma Norte, Mexico City",
    locationLabel: "Roma Norte avenue",
    difficulty: "medium",
    position: { lat: 19.41459, lng: -99.16435 },
    pov: { heading: 136, pitch: 1, zoom: 1 },
  },
  {
    id: "cape-town-bokaap",
    clue: "Colorful facades, mountain weather, and road markings that suggest southern Africa.",
    country: "South Africa",
    region: "Bo-Kaap, Cape Town",
    locationLabel: "Bo-Kaap slope",
    difficulty: "hard",
    position: { lat: -33.91855, lng: 18.41574 },
    pov: { heading: 270, pitch: 1, zoom: 1 },
  },
  {
    id: "vancouver-gastown",
    clue: "North American road geometry with a polished waterfront-city look and wet-climate cues.",
    country: "Canada",
    region: "Gastown, Vancouver",
    locationLabel: "Gastown block",
    difficulty: "easy",
    position: { lat: 49.28342, lng: -123.1083 },
    pov: { heading: 84, pitch: 1, zoom: 1 },
  },
  {
    id: "buenos-aires-palermo",
    clue: "Wide sidewalks, Spanish-language storefronts, and a very walkable Latin American city core.",
    country: "Argentina",
    region: "Palermo, Buenos Aires",
    locationLabel: "Palermo side street",
    difficulty: "hard",
    position: { lat: -34.58078, lng: -58.42471 },
    pov: { heading: 19, pitch: 1, zoom: 1 },
  },
];

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
    difficulty: round.difficulty,
    position: round.position,
    pov: round.pov,
    token: createRoundToken(round),
  };
}
