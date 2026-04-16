import { type Duration } from "date-fns";
export declare function getTimezoneOffset(): string;
export declare function roundToNearestMinutes(timestamp: number, interval?: number): number;
export declare function roundToNearestDate(timestamp: number, interval: number): number;
export declare function formatHMSDuration(diffTime: number, format?: (keyof Duration)[]): string;
export declare function parseServerDate(value: string): Date;
export declare function formatServerDate(value: string): string;
export declare function formatToServerDate(date: Date): string;
