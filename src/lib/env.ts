export const appConfig = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  googleMapsReady: Boolean(process.env.GOOGLE_MAPS_API_KEY),
};
