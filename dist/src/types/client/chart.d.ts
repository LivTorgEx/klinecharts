import { IndicatorCreate, PaneOptions } from "klinecharts";
import { TradeSettingProIndicatorType } from "@livtorgex/strategy-types";
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
export type ChartSettingsProjection = {
    showMessages: boolean;
    showLines: boolean;
    showOrderBookLines: boolean;
    showMovements: boolean;
    indicators: {
        name: TradeSettingProIndicatorType["type"];
        properties: Record<string, boolean>;
    }[];
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
export type ChartInfoDrawType = ChartInfoDrawPrice | ChartInfoDrawPriceLine | ChartInfoDrawPoint | ChartInfoDrawOrderPoint | ChartInfoDrawWindow | ChartInfoDrawLine | ChartInfoDrawCandle | ChartInfoDrawBox;
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
};
export type ChartInfoDrawCandle = {
    variant: "Candle";
    symbol: string;
    time: number;
    price_enter: number;
    price_min: number;
    price_max: number;
};
