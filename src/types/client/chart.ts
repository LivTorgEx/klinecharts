import { IndicatorCreate, PaneOptions } from "klinecharts";

export type ChartSettings = {
  timeframe: number;
  indicators: ChartSettingsIndicator[];
  klinechart: ChartSettingsKLine;
  position: ChartSettingsPosition;
  projection: ChartSettingsProjection;
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

export type ChartSettingsProjectionPlacement = "line1" | "line2" | "tooltip";

export type ChartSettingsProjectionSourceProjectionType =
  | "Status"
  | "NTPS"
  | "TrandM"
  | "Asset"
  | "Price"
  | "OrderBook"
  | "OpenInterest"
  | "Candle";

export type ChartSettingsProjectionProjectionSource = {
  type: "projection";
  name: ChartSettingsProjectionSourceProjectionType;
};

export type ChartSettingsProjectionIndicatorSource = {
  type: "indicator";
  name: string;
  key: string;
  property: string;
  period?: string;
};

export type ChartSettingsProjectionSource =
  | ChartSettingsProjectionProjectionSource
  | ChartSettingsProjectionIndicatorSource;

export type ChartSettingsProjectionItem = {
  id: string;
  placement: ChartSettingsProjectionPlacement;
  source: ChartSettingsProjectionSource;
};

export type ChartSettingsProjection = {
  items: ChartSettingsProjectionItem[];
};

export type ChartInfo = {
  messages: string[];
  signals: ChartInfoSignal[];
  draws: ChartInfoDrawType[];
};

export type ChartInfoSignal = {
  time: number;
  price: number;
  message: string;
};

export type ChartInfoDrawType =
  | ChartInfoDrawPrice
  | ChartInfoDrawPriceLine
  | ChartInfoDrawPoint
  | ChartInfoDrawOrderPoint
  | ChartInfoDrawWindow
  | ChartInfoDrawLine
  | ChartInfoDrawCandle
  | ChartInfoDrawBox;

export type ChartInfoDrawPrice = {
  variant: "Price";
  price: number;
};
export type ChartInfoDrawPriceLine = {
  variant: "PriceLine";
  id?: number | string;
  price: number;
  title?: string;
  extraXGap?: number;
};

export type ChartInfoDrawPoint = {
  variant: "Point";
  price: number;
  time: number;
  title: string;
};

export type ChartInfoDrawWindow = {
  variant: "Window";
  top_price: number;
  bottom_price: number;
  time_start: number;
  time_end?: number;
  title: string;
};

export type ChartInfoDrawBox = {
  variant: "Box";
  start_time: number;
  end_time: number;
  price_min: number;
  price_max: number;
  direction: "SHORT" | "LONG";
  color?: string;
  title?: string;
};

export type ChartInfoDrawLine = {
  variant: "Line";
  price_start: number;
  time_start: number;
  price_end: number;
  time_end: number;
  color?: string;
  dash?: number[];
  title: string;
};

export type ChartInfoDrawOrderPoint = {
  variant: "OrderPoint";
  time: number;
  price: number;
  side: string;
  qty: number;
  // notes: unknown[];
};

export type ChartInfoDrawCandle = {
  variant: "Candle";
  symbol: string;
  time: number;
  price_enter: number;
  price_min: number;
  price_max: number;
};
