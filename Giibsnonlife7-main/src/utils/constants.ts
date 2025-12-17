// Runtime configuration from config.js (can be changed after build)
// Falls back to defaults if config.js is not available
declare global {
  interface Window {
    APP_CONFIG?: {
      API_BASE_URL?: string;
      ROOT_URL?: string;
    };
  }
}

// Use runtime config if available, otherwise fall back to your current values
export const SERVER_URL = window.APP_CONFIG?.API_BASE_URL || `https://nsianlapi.newgibsonline.com/api`;
export const ROOT_URL = window.APP_CONFIG?.ROOT_URL || `https://nsianlapi.newgibsonline.com/`;

// Log warning if using fallback/default values
if (!window.APP_CONFIG?.API_BASE_URL) {
  console.warn(
    "⚠️ API_BASE_URL not found in config.js. Using default production URL. For local development, create public/config.js"
  );
}

export const CHAR_SET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";