import { createContext, useContext } from "react";
import { CHART_SETTINGS_DF } from "../../utils/chart";
export const ChartSettingsContext = createContext(CHART_SETTINGS_DF);
export function useChartSettings() {
    return useContext(ChartSettingsContext);
}
