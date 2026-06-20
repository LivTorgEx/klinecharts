import { format } from "date-fns";

const DATETIME_UI = "yyyy/MM/dd HH:mm:ss";

export function roundToNearestDate(
  timestamp: number,
  interval: number
): number {
  const seconds = timestamp / 1000;
  const rounded_seconds = Math.floor(seconds / interval) * interval;
  return rounded_seconds * 1000;
}

export function formatChartDate(value: number): string {
  const date = new Date(value);
  return format(date, DATETIME_UI);
}
