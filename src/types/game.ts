export type Coordinates = {
  lat: number;
  lng: number;
};

export type RoundSeed = {
  id: string;
  clue: string;
  country: string;
  region: string;
  locationLabel: string;
  difficulty: "easy" | "medium" | "hard";
  position: Coordinates;
  pov: {
    heading: number;
    pitch: number;
    zoom: number;
  };
};

export type PublicRound = {
  id: string;
  clue: string;
  country: string;
  region: string;
  locationLabel: string;
  difficulty: RoundSeed["difficulty"];
  position: Coordinates;
  pov: RoundSeed["pov"];
};

export type GuessResult = {
  score: number;
  timeMultiplier: number;
  distanceKm: number;
  distanceLabel: string;
  answer: {
    id: string;
    country: string;
    region: string;
    locationLabel: string;
    coordinates: Coordinates;
  };
  guess: Coordinates;
  feedback: "perfect" | "strong" | "decent" | "wide";
};
