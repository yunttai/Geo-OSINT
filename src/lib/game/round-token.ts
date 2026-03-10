import { createHmac, timingSafeEqual } from "node:crypto";
import { getRoundTokenSecret } from "@/lib/env";
import type { Coordinates, RoundSeed } from "@/types/game";

type RoundTokenPayload = {
  id: string;
  country: string;
  region: string;
  locationLabel: string;
  position: Coordinates;
  issuedAt: number;
};

function encodePayload(payload: RoundTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getRoundTokenSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createRoundToken(round: RoundSeed) {
  const payload: RoundTokenPayload = {
    id: round.id,
    country: round.country,
    region: round.region,
    locationLabel: round.locationLabel,
    position: round.position,
    issuedAt: Date.now(),
  };

  const encodedPayload = encodePayload(payload);
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyRoundToken(token: string) {
  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const safeProvidedSignature = Buffer.from(providedSignature);
  const safeExpectedSignature = Buffer.from(expectedSignature);

  if (
    safeProvidedSignature.length !== safeExpectedSignature.length ||
    !timingSafeEqual(safeProvidedSignature, safeExpectedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as RoundTokenPayload;

    return payload;
  } catch {
    return null;
  }
}
