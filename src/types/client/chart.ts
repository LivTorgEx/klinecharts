import { IndicatorCreate, PaneOptions } from "klinecharts";

export type ChartSettings = {
  schemaVersion: 1;
  timeframe: number;
  indicators: ChartSettingsIndicator[];
  klinechart: ChartSettingsKLine;
  orderBook: ChartSettingsOrderBook;
  orderHistory: ChartSettingsOrderHistory;
  position: ChartSettingsPosition;
};

export type ChartSettingsIndicator = {
  id: string;
  indicator: IndicatorCreate;
  isStack: boolean;
  paneOptions?: Pick<PaneOptions, "id">;
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

export type ChartSettingsOrderHistory = {
  show: boolean;
};
