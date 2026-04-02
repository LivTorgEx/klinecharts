export const IS_SHOW_UNSTABLE = import.meta.env.VITE_IS_SHOW_UNTABLE === "true";
export const VITE_IS_SHOW_BACKTESTS =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("simulation");
export const IS_DEBUG = import.meta.env.VITE_IS_DEBUG === "true";

export const TF_1M = 60;
export const TF_5M = 300;
export const TF_15M = 900;
export const TF_30M = 1800;
export const TF_1H = 3600;
export const TF_4H = 14400;
export const TIMEFRAMES = [
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
  { value: 900, label: "15m" },
  { value: 1800, label: "30m" },
  { value: 3600, label: "1H" },
  { value: 14400, label: "4H" },
];
