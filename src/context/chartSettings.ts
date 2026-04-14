import { createContext, useContext } from "react";
import { ChartSettings } from "../types/client/chart";
import { CHART_SETTINGS_DF } from "../utils/chart";

export const ChartSettingsContext =
  createContext<ChartSettings>(CHART_SETTINGS_DF);
export function useChartSettings() {
  return useContext(ChartSettingsContext);
}
