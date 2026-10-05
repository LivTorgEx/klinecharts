import { IndicatorCreate, PaneOptions } from "klinecharts";

export type ChartSettings = {
  schemaVersion: 1;
  timeframe: number;
  indicators: ChartSettingsIndicator[];
  klinechart: ChartSettingsKLine;
  orderBook: ChartSettingsOrderBook;
  position: ChartSettingsPosition;
};

export type ChartSettingsIndicator = {
  id: string;
  indicator: IndicatorCreate;
  isStack: boolean;
  paneOptions?: PaneOptions;
};

export type ChartSettingsKLine = {
  mode: "normal" | "weak_magnet" | "strong_magnet";
};

export type ChartSettingsPosition = {
  showFinished: boolean;
};

export type ChartSettingsOrderBook = {
  show: boolean;
};
