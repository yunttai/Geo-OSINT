import { GameConsole } from "@/components/game-console";
import { appConfig } from "@/lib/env";

export default function Home() {
  return (
    <GameConsole
      googleMapsApiKey={appConfig.googleMapsApiKey}
      googleMapsEnabled={appConfig.googleMapsReady}
    />
  );
}
