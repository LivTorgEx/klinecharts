import { parseServerDate } from "./date";

export function formatNum(amount: number, precision = 0): string {
  const roundedAmount = amount.toFixed(precision);
  const parts = roundedAmount.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function toMeasurePrice(prev_price: number, price: number): number {
  return ((price - prev_price) * 100) / prev_price;
}

export function roundToNearestPrice(price: number, interval = 1): number {
  return Math.ceil(price / interval) * interval;
}

export function toChartY(price: number, zeroPrice: number, gapY: number) {
  return (zeroPrice - price) / gapY;
}

export function toChartX(
  time: string | number,
  timeStart: number,
  timeframe: number,
  gapBar: number
) {
  const timeNum =
    typeof time === "string" ? parseServerDate(time).getTime() : time;

  return ((timeNum - timeStart) / (timeframe * 1000)) * gapBar;
}

export function format_tf(value: number | string): string {
  const tf = typeof value === "number" ? value : (parseInputInt(value) ?? 0);

  if (tf < 3600) {
    return `${(tf / 60).toFixed(0)}m`;
  }

  return `${(tf / 3600).toFixed(0)}h`;
}

export function formatBigNumber(volume: number, unit: string = "₮"): string {
  const val = Math.abs(volume);
  if (val === 0) {
    return "";
  } else if (val > 1_000_000) {
    return (volume / 1_000_000).toFixed(2) + `m${unit}`;
  } else if (val > 1_000) {
    return (volume / 1_000).toFixed(2) + `k${unit}`;
  } else if (val < 1) {
    return volume.toFixed(4) + unit;
  } else if (val < 10) {
    return volume.toFixed(2) + unit;
  } else {
    return volume.toFixed(0) + unit;
  }
}

export function parseInputFloat<T extends number | null = null>(
  value: string,
  initial: T = null as T
): T | number {
  try {
    const parsedValue = parseFloat(value);

    return isNaN(parsedValue) ? initial : parsedValue;
  } catch {
    return initial;
  }
}

export function parseInputInt(value: string): null | number {
  try {
    const parsedValue = parseInt(value);

    return isNaN(parsedValue) ? null : parsedValue;
  } catch {
    return null;
  }
}
