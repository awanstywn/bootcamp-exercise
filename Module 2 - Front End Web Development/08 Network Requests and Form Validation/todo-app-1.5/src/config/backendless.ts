// export env variable
export const APP_ID = import.meta.env.VITE_BACKENDLESS_APP_ID || "";
export const API_KEY = import.meta.env.VITE_BACKENDLESS_API_KEY || "";

// export base url
export const BASE_URL = `https://api.backendless.com/${APP_ID}/${API_KEY}`;
