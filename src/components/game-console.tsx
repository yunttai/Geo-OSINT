"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Coordinates, GuessResult, PublicRound } from "@/types/game";

type GameConsoleProps = {
  googleMapsApiKey: string;
  googleMapsEnabled: boolean;
  supabaseEnabled: boolean;
};

type GuessDraft = {
  lat: string;
  lng: string;
};

function getFeedbackLabel(result: GuessResult | null) {
  switch (result?.feedback) {
    case "perfect":
      return "Nearly exact";
    case "strong":
      return "Strong regional read";
    case "decent":
      return "Country-level hit";
    case "wide":
      return "You need more clues";
    default:
      return "Waiting for your guess";
  }
}

function parseGuess(draft: GuessDraft): Coordinates | null {
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);

  if (
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { lat, lng };
}

export function GameConsole({
  googleMapsApiKey,
  googleMapsEnabled,
  supabaseEnabled,
}: GameConsoleProps) {
  const panoramaContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const [round, setRound] = useState<PublicRound | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [loadingRound, setLoadingRound] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [guessDraft, setGuessDraft] = useState<GuessDraft>({ lat: "", lng: "" });
  const [message, setMessage] = useState("Fresh round. Pan the scene, click the map, then submit.");

  const parsedManualGuess = useMemo(() => parseGuess(guessDraft), [guessDraft]);
  const activeGuess = parsedManualGuess || guess;

  async function loadRound(excludedRoundIds: string[] = []) {
    setLoadingRound(true);
    setMessage("Generating a new round...");

    const params = new URLSearchParams();

    if (excludedRoundIds.length) {
      params.set("exclude", excludedRoundIds.join(","));
    }

    const response = await fetch(`/api/game/round?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch a round.");
    }

    const payload = (await response.json()) as { round: PublicRound };
    setRound(payload.round);
    setResult(null);
    setGuess(null);
    setGuessDraft({ lat: "", lng: "" });
    setStartedAt(Date.now());
    setMessage("Fresh round. Pan the scene, click the map, then submit.");
  }

  useEffect(() => {
    loadRound()
      .catch(() => {
        setMessage("Round generation failed. Check the API route.");
      })
      .finally(() => {
        setLoadingRound(false);
      });
  }, []);

  useEffect(() => {
    if (!mapsReady || !round || !window.google || !panoramaContainerRef.current || !mapContainerRef.current) {
      return;
    }

    clickListenerRef.current?.remove();

    panoramaRef.current = new window.google.maps.StreetViewPanorama(
      panoramaContainerRef.current,
      {
        position: round.position,
        pov: round.pov,
        zoom: round.pov.zoom,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        showRoadLabels: false,
      },
    );

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 20, lng: 8 },
      zoom: 2,
      minZoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
    });

    markerRef.current = new window.google.maps.Marker({
      map: mapRef.current,
      visible: false,
    });

    clickListenerRef.current = mapRef.current.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !markerRef.current) {
        return;
      }

      const nextGuess = {
        lat: Number(event.latLng.lat().toFixed(5)),
        lng: Number(event.latLng.lng().toFixed(5)),
      };

      markerRef.current.setPosition(nextGuess);
      markerRef.current.setVisible(true);
      setGuess(nextGuess);
      setGuessDraft({
        lat: nextGuess.lat.toFixed(5),
        lng: nextGuess.lng.toFixed(5),
      });
      setMessage("Guess locked. Submit when you're ready.");
    });

    return () => {
      clickListenerRef.current?.remove();
    };
  }, [mapsReady, round]);

  async function handleSubmit() {
    if (!round || !activeGuess || !startedAt) {
      setMessage("Add a valid guess first.");
      return;
    }

    setSubmitting(true);
    setMessage("Scoring your guess...");

    try {
      const response = await fetch("/api/game/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: round.token,
          guess: activeGuess,
          elapsedMs: Date.now() - startedAt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to score guess.");
      }

      const payload = (await response.json()) as { result: GuessResult };
      setResult(payload.result);
      setMessage(
        payload.result.savedToLeaderboard
          ? "Guess saved to Supabase leaderboard."
          : "Guess scored locally. Sign in to persist results.",
      );
    } catch {
      setMessage("Scoring failed. Check your environment variables and API route.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNextRound() {
    const excluded = round ? [round.id] : [];
    setLoadingRound(true);

    try {
      await loadRound(excluded);
    } catch {
      setMessage("Could not load the next round.");
    } finally {
      setLoadingRound(false);
    }
  }

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-6 lg:p-8">
      {googleMapsEnabled ? (
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=weekly`}
          strategy="afterInteractive"
          onReady={() => setMapsReady(true)}
          onError={() => setMapsError("Google Maps script failed to load. Check the browser-restricted key.")}
        />
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-xs text-[var(--accent-200)]">Live Round</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                Street View first, architecture second
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNextRound}
              disabled={loadingRound}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingRound ? "Loading..." : "New round"}
            </button>
          </div>

          <div className="maps-shell">
            {googleMapsEnabled && !mapsError ? (
              <div ref={panoramaContainerRef} className="h-[22rem] w-full md:h-[30rem]" />
            ) : (
              <div className="flex h-[22rem] items-center justify-center px-6 text-center text-sm leading-7 text-[var(--ink-200)] md:h-[30rem]">
                Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, enable Maps JavaScript API, and restrict the key to your Vercel
                domain. The fallback UI keeps the round and score flow working without the panorama.
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="maps-shell">
              {googleMapsEnabled && !mapsError ? (
                <div ref={mapContainerRef} className="h-[18rem] w-full" />
              ) : (
                <div className="flex h-[18rem] items-center justify-center px-6 text-center text-sm leading-7 text-[var(--ink-200)]">
                  No map widget yet. Enter latitude and longitude manually to keep testing the scoring path.
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-[var(--surface-900)]/80 p-4">
              <div className="space-y-4">
                <div>
                  <p className="panel-title text-white">Round brief</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-200)]">
                    {round?.clue || "Fetching a clue..."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs text-[var(--ink-400)]">Latitude</span>
                    <input
                      value={guessDraft.lat}
                      onChange={(event) =>
                        {
                          setGuess(null);
                          setGuessDraft((current) => ({ ...current, lat: event.target.value }));
                        }
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[var(--surface-850)] px-3 py-3 text-sm outline-none transition focus:border-[var(--accent-400)]/40"
                      placeholder="37.5665"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs text-[var(--ink-400)]">Longitude</span>
                    <input
                      value={guessDraft.lng}
                      onChange={(event) =>
                        {
                          setGuess(null);
                          setGuessDraft((current) => ({ ...current, lng: event.target.value }));
                        }
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[var(--surface-850)] px-3 py-3 text-sm outline-none transition focus:border-[var(--accent-400)]/40"
                      placeholder="126.9780"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !activeGuess}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-5 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--ink-400)]"
                  >
                    {submitting ? "Scoring..." : "Submit guess"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGuess(null);
                      setGuessDraft({ lat: "", lng: "" });
                      markerRef.current?.setVisible(false);
                      setMessage("Guess cleared.");
                    }}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full xl:max-w-[22rem]">
          <div className="rounded-[1.75rem] border border-white/8 bg-[var(--surface-900)]/82 p-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">Round Ops</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/80 p-4">
                <p className="text-xs text-[var(--ink-400)]">Status</p>
                <p className="stat-value mt-2 text-2xl text-white">{getFeedbackLabel(result)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/80 p-4">
                <p className="text-xs text-[var(--ink-400)]">Score</p>
                <p className="stat-value mt-2 text-2xl text-white">{result ? result.score : "--"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/80 p-4">
                <p className="text-xs text-[var(--ink-400)]">Distance</p>
                <p className="stat-value mt-2 text-2xl text-white">{result ? result.distanceLabel : "--"}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-black/15 p-4">
              <p className="panel-title text-white">Runtime status</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink-200)]">
                <li>Google Maps: {googleMapsEnabled ? (mapsError ? "configured but failing" : "configured") : "missing key"}</li>
                <li>Supabase: {supabaseEnabled ? "configured" : "not configured"}</li>
                <li>{message}</li>
              </ul>
            </div>

            {result ? (
              <div className="mt-5 rounded-[1.5rem] border border-[var(--accent-400)]/20 bg-[rgba(255,143,63,0.08)] p-4 text-sm leading-7 text-[var(--ink-200)]">
                <p className="panel-title text-white">Reveal</p>
                <p className="mt-2">
                  {result.answer.locationLabel}, {result.answer.region}, {result.answer.country}
                </p>
                <p className="text-[var(--ink-400)]">
                  Accuracy multiplier: {(result.timeMultiplier * 100).toFixed(0)}%
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
