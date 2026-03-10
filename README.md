# GeoOSINT

로그인, 이메일, 데이터베이스 저장 없이 바로 플레이할 수 있는 GeoGuessr 스타일 데모입니다.

## 포함된 기능

- `GET /api/game/round`로 라운드를 불러오는 플레이 흐름
- Google Maps JavaScript API 기반 Street View와 추측 지도
- 클릭한 위치와 정답 위치를 함께 보여주는 결과 지도
- 하버사인 거리 계산과 로컬 점수 계산
- 로그인, 이메일, 리더보드, DB 저장 제거

## 로컬 실행

1. 의존성을 설치합니다.

```bash
npm install
```

2. `.env.local`에 아래 값을 넣습니다.

```bash
GOOGLE_MAPS_API_KEY=your_browser_key
```

3. 개발 서버를 실행합니다.

```bash
npm run dev
```

## Google Maps 설정

1. Google Cloud 프로젝트를 만들고 결제를 활성화합니다.
2. `Maps JavaScript API`를 켭니다.
3. 브라우저 키를 만들고 HTTP referrer를 제한합니다.
4. 발급한 키를 `GOOGLE_MAPS_API_KEY`에 넣습니다.

## 동작 방식

- 스트리트뷰를 보고 위치를 추정합니다.
- 지도에 클릭하거나 위도/경도를 직접 입력합니다.
- 즉시 거리와 점수를 계산합니다.
- 결과 창에서 `G`는 내 추측, `A`는 정답을 의미합니다.

## 검증

```bash
npm run lint
npm run build
```
*** Add File: d:\Geo-OSINT\src\app\page.tsx
import Link from "next/link";
import { GameConsole } from "@/components/game-console";
import { appConfig } from "@/lib/env";

const featureCards = [
  {
    title: "No Auth",
    value: "로그인 없이 바로 플레이",
    body: "이메일 입력이나 인증 절차 없이 스트리트뷰를 보고 즉시 위치를 추측할 수 있습니다.",
  },
  {
    title: "No DB",
    value: "결과 저장 없음",
    body: "추측 결과는 화면에서 바로 확인만 하고 별도 데이터베이스에는 저장하지 않습니다.",
  },
  {
    title: "Reveal Map",
    value: "정답과 추측을 같이 표시",
    body: "결과 창에서 내 추측과 정답을 지도 위에 동시에 보여주고 거리를 계산합니다.",
  },
];

const setupChecklist = [
  "Google Cloud에서 Maps JavaScript API를 켜고 브라우저 키를 발급합니다.",
  "`.env.local`에 `GOOGLE_MAPS_API_KEY`를 넣습니다.",
  "개발 서버를 띄운 뒤 지도에서 위치를 찍고 결과 창을 확인합니다.",
  "별도 로그인이나 DB 설정 없이 그대로 배포 가능합니다.",
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="glass-panel grid-panel rounded-[2.25rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">GeoOSINT</p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              위치를 찍으면 거리와 결과 지도가 바로 나오는 단일 플레이 흐름
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--ink-200)] sm:text-lg">
              이 버전은 로그인, 이메일, 데이터 저장을 모두 제거한 상태입니다. 스트리트뷰를 보고 지도에 위치를
              찍으면 정답과의 거리를 계산하고, 결과 창에서 정답 위치와 내 추측 위치를 함께 보여줍니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#play"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--accent-400)]/40 bg-[var(--accent-400)] px-5 text-sm font-semibold text-[var(--surface-950)] transition hover:bg-[var(--accent-300)]"
              >
                바로 플레이
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-[var(--ink-200)] transition hover:border-[var(--accent-400)]/40 hover:text-white"
              >
                동작 방식 보기
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-[var(--surface-900)]/76 p-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">Runtime</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Google Maps</p>
                <p className="stat-value mt-2 text-2xl text-white">
                  {appConfig.googleMapsReady ? "Configured" : "Key missing"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Storage</p>
                <p className="stat-value mt-2 text-2xl text-white">Disabled</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-850)]/90 p-4">
                <p className="text-xs text-[var(--ink-400)]">Auth</p>
                <p className="stat-value mt-2 text-2xl text-white">Disabled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {featureCards.map((card) => (
          <article key={card.title} className="glass-panel rounded-[1.75rem] p-5">
            <p className="eyebrow text-xs text-[var(--accent-200)]">{card.title}</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{card.value}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-200)]">{card.body}</p>
          </article>
        ))}
      </section>

      <section id="play" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-xs text-[var(--accent-200)]">Playable Slice</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              위치 선택, 거리 계산, 결과 지도 표시
            </h2>
          </div>
        </div>
        <GameConsole
          googleMapsApiKey={appConfig.googleMapsApiKey}
          googleMapsEnabled={appConfig.googleMapsReady}
        />
      </section>

      <section id="how-it-works" className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="glass-panel rounded-[2rem] p-6">
          <p className="eyebrow text-xs text-[var(--accent-200)]">Setup</p>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-200)]">
            {setupChecklist.map((item) => (
              <li key={item} className="rounded-[1.25rem] border border-white/8 bg-[var(--surface-900)]/74 px-4 py-3">
                {item}
              </li>
            ))}
          </ol>
        </article>

        <article className="glass-panel rounded-[2rem] p-6">
          <p className="eyebrow text-xs text-[var(--accent-200)]">Flow</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--ink-200)]">
            <p>
              `GET /api/game/round`는 샘플 라운드 하나를 반환합니다. 사용자는 스트리트뷰와 지도 단서를 보고 위치를
              선택합니다.
            </p>
            <p>
              거리 계산은 브라우저에서 바로 수행되고, 결과 영역에서는 추측 위치와 정답 위치를 한 지도 위에 표시합니다.
            </p>
            <p>
              현재 구조에는 로그인, 이메일, 리더보드, 데이터 저장 계층이 없습니다. 필요한 것은 Google Maps 키뿐입니다.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
