"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { scoreGuess } from "@/lib/game/scoring";
import type { Coordinates, GuessResult, PublicRound } from "@/types/game";

type GameConsoleProps = {
  googleMapsApiKey: string;
  googleMapsEnabled: boolean;
};

type Screen = "intro" | "game" | "result";
const ROUND_TIME_LIMIT_MS = 60_000;

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function BrandMark({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className={`relative overflow-hidden rounded-2xl bg-white/8 ${compact ? "h-12 w-12" : "h-18 w-18"}`}>
        <Image
          src="/mjsec-logo.svg"
          alt="MJSEC Geo-OSINT logo"
          fill
          className="object-contain p-2"
          priority
        />
      </div>
      <div className={compact ? "text-left" : "text-center"}>
        <p className="eyebrow text-xs text-[var(--accent-200)]">MJSEC</p>
        <h1 className={`${compact ? "mt-1 text-2xl" : "mt-2 text-4xl sm:text-5xl"} font-semibold tracking-[-0.05em] text-white`}>
          Geo-OSINT
        </h1>
      </div>
    </>
  );

  if (!onClick) {
    return (
      <div className={`flex items-center justify-center gap-3 ${compact ? "justify-start" : ""}`}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="처음으로 돌아가기"
      className={`flex items-center justify-center gap-3 rounded-[1.5rem] transition hover:opacity-90 ${compact ? "justify-start" : ""}`}
    >
      {content}
    </button>
  );
}

export function GameConsole({ googleMapsApiKey, googleMapsEnabled }: GameConsoleProps) {
  const panoramaContainerRef = useRef<HTMLDivElement>(null);
  const guessMapContainerRef = useRef<HTMLDivElement>(null);
  const resultMapContainerRef = useRef<HTMLDivElement>(null);
  const guessMapRef = useRef<google.maps.Map | null>(null);
  const resultMapRef = useRef<google.maps.Map | null>(null);
  const guessMarkerRef = useRef<google.maps.Marker | null>(null);
  const resultGuessMarkerRef = useRef<google.maps.Marker | null>(null);
  const resultAnswerMarkerRef = useRef<google.maps.Marker | null>(null);
  const resultLineRef = useRef<google.maps.Polyline | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const roundRequestIdRef = useRef(0);

  const [screen, setScreen] = useState<Screen>("intro");
  const [round, setRound] = useState<PublicRound | null>(null);
  const [guess, setGuess] = useState<Coordinates | null>(null);
  const [result, setResult] = useState<GuessResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [loadingRound, setLoadingRound] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(ROUND_TIME_LIMIT_MS);
  const [timeoutHandled, setTimeoutHandled] = useState(false);
  const [submittedByTimeout, setSubmittedByTimeout] = useState(false);

  async function fetchRound(excludedRoundIds: string[] = []) {
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
    return payload.round;
  }

  async function startRound(excludedRoundIds: string[] = []) {
    const requestId = ++roundRequestIdRef.current;
    setLoadingRound(true);
    setErrorMessage(null);

    try {
      const nextRound = await fetchRound(excludedRoundIds);

      if (requestId !== roundRequestIdRef.current) {
        return;
      }

      setRound(nextRound);
      setGuess(null);
      setResult(null);
      setStartedAt(Date.now());
      setRemainingMs(ROUND_TIME_LIMIT_MS);
      setTimeoutHandled(false);
      setSubmittedByTimeout(false);
      setScreen("game");
    } catch {
      if (requestId !== roundRequestIdRef.current) {
        return;
      }

      setErrorMessage("라운드를 불러오지 못했습니다.");
    } finally {
      if (requestId === roundRequestIdRef.current) {
        setLoadingRound(false);
      }
    }
  }

  function handleBackToIntro(message: string | null = null) {
    roundRequestIdRef.current += 1;
    setLoadingRound(false);
    setRound(null);
    setGuess(null);
    setResult(null);
    setStartedAt(null);
    setRemainingMs(ROUND_TIME_LIMIT_MS);
    setTimeoutHandled(false);
    setSubmittedByTimeout(false);
    setErrorMessage(message);
    setScreen("intro");
  }

  useEffect(() => {
    if (screen !== "game" || !startedAt) {
      return;
    }

    const deadline = startedAt + ROUND_TIME_LIMIT_MS;

    const updateRemainingTime = () => {
      setRemainingMs(Math.max(0, deadline - Date.now()));
    };

    updateRemainingTime();

    const intervalId = window.setInterval(updateRemainingTime, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [screen, startedAt]);

  useEffect(() => {
    if (!mapsReady || !round || screen !== "game" || !window.google || !panoramaContainerRef.current || !guessMapContainerRef.current) {
      return;
    }

    clickListenerRef.current?.remove();

    new window.google.maps.StreetViewPanorama(panoramaContainerRef.current, {
      position: round.position,
      pov: round.pov,
      zoom: round.pov.zoom,
      addressControl: false,
      fullscreenControl: false,
      motionTracking: false,
      showRoadLabels: false,
    });

    guessMapRef.current = new window.google.maps.Map(guessMapContainerRef.current, {
      center: { lat: 20, lng: 8 },
      zoom: 2,
      minZoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
    });

    guessMarkerRef.current = new window.google.maps.Marker({
      map: guessMapRef.current,
      visible: false,
    });

    clickListenerRef.current = guessMapRef.current.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || !guessMarkerRef.current) {
        return;
      }

      const nextGuess = {
        lat: Number(event.latLng.lat().toFixed(5)),
        lng: Number(event.latLng.lng().toFixed(5)),
      };

      guessMarkerRef.current.setPosition(nextGuess);
      guessMarkerRef.current.setVisible(true);
      setGuess(nextGuess);
    });

    return () => {
      clickListenerRef.current?.remove();
    };
  }, [mapsReady, round, screen]);

  useEffect(() => {
    if (!mapsReady || !result || screen !== "result" || !window.google || !resultMapContainerRef.current) {
      return;
    }

    resultMapRef.current = new window.google.maps.Map(resultMapContainerRef.current, {
      center: result.answer.coordinates,
      zoom: 3,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
    });

    resultGuessMarkerRef.current?.setMap(null);
    resultAnswerMarkerRef.current?.setMap(null);
    resultLineRef.current?.setMap(null);

    resultGuessMarkerRef.current = new window.google.maps.Marker({
      map: resultMapRef.current,
      position: result.guess,
      label: "G",
      title: "내가 찍은 위치",
    });

    resultAnswerMarkerRef.current = new window.google.maps.Marker({
      map: resultMapRef.current,
      position: result.answer.coordinates,
      label: "A",
      title: "정답 위치",
    });

    resultLineRef.current = new window.google.maps.Polyline({
      map: resultMapRef.current,
      path: [result.guess, result.answer.coordinates],
      strokeColor: "#ff8f3f",
      strokeOpacity: 0.9,
      strokeWeight: 3,
    });

    if (result.distanceKm < 1) {
      resultMapRef.current.setCenter(result.answer.coordinates);
      resultMapRef.current.setZoom(14);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(result.guess);
    bounds.extend(result.answer.coordinates);
    resultMapRef.current.fitBounds(bounds, 72);
  }, [mapsReady, result, screen]);

  function handleSubmit(elapsedOverrideMs?: number, isTimeout = false) {
    if (!round || !guess || !startedAt) {
      return;
    }

    const nextResult: GuessResult = {
      ...scoreGuess({
        answer: round.position,
        guess,
        elapsedMs: elapsedOverrideMs ?? Date.now() - startedAt,
      }),
      answer: {
        id: round.id,
        country: round.country,
        region: round.region,
        locationLabel: round.locationLabel,
        coordinates: round.position,
      },
      guess,
    };

    setSubmittedByTimeout(isTimeout);
    setResult(nextResult);
    setScreen("result");
  }

  const handleTimeoutSubmit = useEffectEvent(() => {
    if (round && guess && startedAt) {
      handleSubmit(ROUND_TIME_LIMIT_MS, true);
      return;
    }

    handleBackToIntro("시간이 종료되었습니다. 위치를 선택하지 않아 라운드가 종료되었습니다.");
  });

  useEffect(() => {
    if (screen !== "game" || remainingMs > 0 || timeoutHandled) {
      return;
    }

    setTimeoutHandled(true);
    handleTimeoutSubmit();
  }, [remainingMs, screen, timeoutHandled]);

  return (
    <section className="w-full">
      {googleMapsEnabled ? (
        <Script
          id="google-maps-script"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=weekly`}
          strategy="afterInteractive"
          onReady={() => setMapsReady(true)}
          onError={() => setMapsError("Google Maps 스크립트를 불러오지 못했습니다.")}
        />
      ) : null}

      {screen === "intro" ? (
        <div className="glass-panel mx-auto max-w-3xl rounded-[2.2rem] px-6 py-10 text-center sm:px-10 sm:py-14">
          <BrandMark />
          <h2 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            거리뷰를 보고 정답 위치를 맞히는 게임입니다.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--ink-200)] sm:text-lg">
            거리뷰를 확인한 뒤 지도에 위치를 찍고 제출하면, 결과 화면에서 내가 찍은 위치와 정답 위치 그리고
            두 지점 사이의 거리를 확인할 수 있습니다.
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--accent-200)]">제한시간은 1분입니다.</p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => void startRound()}
              disabled={loadingRound}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-6 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--ink-400)]"
            >
              {loadingRound ? "불러오는 중..." : "시작하기"}
            </button>
          </div>
          {errorMessage ? <p className="mt-4 text-sm text-[var(--danger-300)]">{errorMessage}</p> : null}
        </div>
      ) : null}

      {screen === "game" ? (
        <div className="space-y-4">
          <div className="glass-panel rounded-[1.8rem] px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <BrandMark compact onClick={handleBackToIntro} />
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-900)]/80 px-4 py-3 text-center sm:min-w-[8rem]">
                <p className="eyebrow text-[11px] text-[var(--accent-200)]">Timer</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {formatRemainingTime(remainingMs)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="maps-shell">
              {googleMapsEnabled && !mapsError ? (
                <div ref={panoramaContainerRef} className="h-[28rem] w-full md:h-[36rem]" />
              ) : (
                <div className="flex h-[28rem] items-center justify-center px-6 text-center text-sm leading-7 text-[var(--ink-200)] md:h-[36rem]">
                  Google Maps 키가 없거나 로드에 실패해서 거리뷰를 표시할 수 없습니다.
                </div>
              )}
            </div>

            <div className="maps-shell relative">
              {googleMapsEnabled && !mapsError ? (
                <div ref={guessMapContainerRef} className="h-[28rem] w-full md:h-[36rem]" />
              ) : (
                <div className="flex h-[28rem] items-center justify-center px-6 text-center text-sm leading-7 text-[var(--ink-200)] md:h-[36rem]">
                  Google Maps 키가 없거나 로드에 실패해서 지도를 표시할 수 없습니다.
                </div>
              )}

              <div className="absolute inset-x-4 bottom-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!guess}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-6 text-sm font-semibold text-[var(--surface-950)] shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition hover:bg-[var(--accent-300)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--ink-400)]"
                >
                  제출
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {screen === "result" && result ? (
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="glass-panel rounded-[1.8rem] px-5 py-4">
            <BrandMark compact onClick={handleBackToIntro} />
          </div>

          <div className="maps-shell">
            {googleMapsEnabled && !mapsError ? (
              <div ref={resultMapContainerRef} className="h-[14rem] w-full md:h-[20rem]" />
            ) : (
              <div className="flex h-[18rem] items-center justify-center px-6 text-center text-sm leading-7 text-[var(--ink-200)] md:h-[24rem]">
                Google Maps 키가 없거나 로드에 실패해서 결과 지도를 표시할 수 없습니다.
              </div>
            )}
          </div>

          <div className="glass-panel rounded-[2rem] px-6 py-8 text-center sm:px-8">
            <p className="eyebrow text-xs text-[var(--accent-200)]">Result</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {result.distanceLabel} 차이
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-200)]">
              지도에서 `G`는 내가 찍은 위치, `A`는 정답 위치입니다.
            </p>
            {submittedByTimeout ? (
              <p className="mt-3 text-sm leading-7 text-[var(--accent-200)]">
                제한시간이 끝나 자동 제출되었습니다.
              </p>
            ) : null}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => void startRound(round ? [round.id] : [])}
                disabled={loadingRound}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-6 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[var(--ink-400)]"
              >
                {loadingRound ? "불러오는 중..." : "다시하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
