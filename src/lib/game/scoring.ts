import type { Coordinates, GuessResult } from "@/types/game";

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(origin: Coordinates, target: Coordinates) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(target.lat - origin.lat);
  const deltaLng = toRadians(target.lng - origin.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(target.lat)) *
      Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}

export function getFeedback(distanceKm: number): GuessResult["feedback"] {
  if (distanceKm <= 10) {
    return "perfect";
  }

  if (distanceKm <= 100) {
    return "strong";
  }

  if (distanceKm <= 500) {
    return "decent";
  }

  return "wide";
}

export function scoreGuess({
  answer,
  guess,
  elapsedMs,
}: {
  answer: Coordinates;
  guess: Coordinates;
  elapsedMs: number;
}) {
  const distanceKm = getDistanceKm(answer, guess);
  const baseScore = 5000 * Math.exp(-distanceKm / 2200);
  const timePenaltyRatio = Math.min(elapsedMs / 180000, 1) * 0.25;
  const timeMultiplier = 1 - timePenaltyRatio;
  const score = Math.max(0, Math.round(baseScore * timeMultiplier));

  return {
    distanceKm,
    distanceLabel: formatDistance(distanceKm),
    score,
    timeMultiplier: Number(timeMultiplier.toFixed(3)),
    feedback: getFeedback(distanceKm),
  };
}
