import {
  formatDuration,
  intervalToDuration,
  parseISO,
  format,
  addMinutes,
} from "date-fns";
import { DATETIME_SERVER, DATETIME_UI } from "../constants/date";

export function getTimezoneOffset(): string {
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function roundToNearestMinutes(timestamp: number, interval = 5): number {
  // Конвертируем миллисекунды в минуты
  const minutes = timestamp / 1000 / 60;

  // Округляем до ближайшего 5-минутного интервала
  const roundedMinutes = Math.floor(minutes / interval) * interval;

  // Конвертируем обратно в миллисекунды
  const roundedTimestamp = roundedMinutes * 60 * 1000;

  return roundedTimestamp;
}

export function roundToNearestDate(
  timestamp: number,
  interval: number
): number {
  const seconds = timestamp / 1000;
  const rounded_seconds = Math.floor(seconds / interval) * interval;
  return rounded_seconds * 1000;
}

export function formatHMSDuration(
  diffTime: number,
  format: string[] = ["days", "hours", "minutes", "seconds"]
): string {
  const duration = intervalToDuration({
    start: 0,
    end: diffTime,
  });

  return formatDuration(duration, {
    // includeSeconds: true,
    format,
    zero: true,
    delimiter: ":",
    locale: {
      formatDistance: (_token, count) => String(count).padStart(2, "0"),
    },
  });
}

export function parseServerDate(value: string): Date {
  return parseISO(`${value}Z`);
}

export function formatServerDate(value: string): string {
  const date = parseServerDate(value);
  return format(date, DATETIME_UI);
}

export function formatToServerDate(date: Date) {
  return format(addMinutes(date, date.getTimezoneOffset()), DATETIME_SERVER);
}
