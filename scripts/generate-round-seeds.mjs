import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, ".codex-tmp", "cities5000", "cities5000.txt");
const outputPath = path.join(rootDir, "src", "lib", "game", "generated-round-seeds.ts");
const targetCount = 1000;

const allowedCountryCodes = new Set([
  "AR",
  "AT",
  "AU",
  "BE",
  "BG",
  "BR",
  "CA",
  "CH",
  "CL",
  "CO",
  "CZ",
  "DE",
  "DK",
  "EC",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "ID",
  "IE",
  "IL",
  "IT",
  "JP",
  "LT",
  "LU",
  "LV",
  "MX",
  "MY",
  "NL",
  "NO",
  "NZ",
  "PE",
  "PL",
  "PT",
  "RO",
  "SE",
  "SG",
  "SI",
  "SK",
  "TH",
  "TR",
  "TW",
  "US",
  "UY",
  "ZA",
]);

const clueTemplates = [
  "Urban streets, commercial blocks, and road signs are the main signals here.",
  "Look for driving side, lane markings, and storefront language.",
  "Street furniture, road paint, and building style matter more than landmarks.",
  "This round comes from a built-up city area with useful signage clues.",
  "Use road geometry, density, and curb details to narrow it down.",
  "Treat it as a city-center read: vehicles, signs, and streetscape first.",
];

const regionDisplay = new Intl.DisplayNames(["en"], { type: "region" });

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDifficulty(population) {
  if (population >= 1_500_000) {
    return "easy";
  }

  if (population >= 250_000) {
    return "medium";
  }

  return "hard";
}

function getPitch(geonameId) {
  return [-2, -1, 0, 1, 2][geonameId % 5];
}

function toRoundSeed(city, index) {
  const country = regionDisplay.of(city.countryCode) ?? city.countryCode;
  const displayName = city.asciiName || city.name;

  return {
    id: `${slugify(displayName)}-${city.geonameId}`,
    clue: `${clueTemplates[index % clueTemplates.length]} ${displayName}, ${country}.`,
    country,
    region: displayName,
    locationLabel: `${displayName} city area`,
    difficulty: getDifficulty(city.population),
    position: {
      lat: Number(city.lat.toFixed(5)),
      lng: Number(city.lng.toFixed(5)),
    },
    pov: {
      heading: city.geonameId % 360,
      pitch: getPitch(city.geonameId),
      zoom: 1,
    },
  };
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Missing source dataset: ${sourcePath}`);
}

const rows = fs
  .readFileSync(sourcePath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const parts = line.split("\t");

    return {
      geonameId: Number(parts[0]),
      name: parts[1],
      asciiName: parts[2],
      lat: Number(parts[4]),
      lng: Number(parts[5]),
      countryCode: parts[8],
      population: Number(parts[14] || 0),
    };
  })
  .filter(
    (city) =>
      allowedCountryCodes.has(city.countryCode) &&
      Number.isFinite(city.lat) &&
      Number.isFinite(city.lng) &&
      city.population >= 50_000 &&
      city.name,
  );

const deduped = [];
const seen = new Set();

for (const city of rows) {
  const key = `${city.countryCode}:${city.name.toLowerCase()}:${city.lat.toFixed(3)}:${city.lng.toFixed(3)}`;

  if (seen.has(key)) {
    continue;
  }

  seen.add(key);
  deduped.push(city);
}

const grouped = new Map();

for (const city of deduped) {
  const group = grouped.get(city.countryCode) ?? [];
  group.push(city);
  grouped.set(city.countryCode, group);
}

for (const group of grouped.values()) {
  group.sort((left, right) => right.population - left.population);
}

const countryOrder = [...grouped.entries()]
  .sort((left, right) => right[1].length - left[1].length)
  .map(([countryCode]) => countryCode);

const selected = [];
let round = 0;

while (selected.length < targetCount) {
  let addedInRound = false;

  for (const countryCode of countryOrder) {
    const group = grouped.get(countryCode);

    if (!group || round >= group.length) {
      continue;
    }

    selected.push(group[round]);
    addedInRound = true;

    if (selected.length === targetCount) {
      break;
    }
  }

  if (!addedInRound) {
    break;
  }

  round += 1;
}

if (selected.length < targetCount) {
  throw new Error(`Only generated ${selected.length} distinct places.`);
}

const generatedRoundSeeds = selected.map((city, index) => toRoundSeed(city, index));
const output = `import type { RoundSeed } from "@/types/game";

export const generatedRoundSeeds: RoundSeed[] = ${JSON.stringify(generatedRoundSeeds, null, 2)};
`;

fs.writeFileSync(outputPath, output);
console.log(`Wrote ${generatedRoundSeeds.length} round seeds to ${outputPath}`);
