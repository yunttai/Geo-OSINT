export const appConfig = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  googleMapsReady: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
};
