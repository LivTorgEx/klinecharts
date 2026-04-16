import type { ChartSettings } from "../types/client/chart";
export declare const CHART_SETTINGS_DF: ChartSettings;
export declare function loadChartSettings(name: string): ChartSettings;
type PartialUpdateChartSettingsFn = (prevSettins: ChartSettings) => Partial<ChartSettings> | false;
export declare function partialUpdateChartSettings(name: string, settings: Partial<ChartSettings> | PartialUpdateChartSettingsFn): void;
export declare function updateChartSettings(name: string, settings: ChartSettings): void;
export {};
