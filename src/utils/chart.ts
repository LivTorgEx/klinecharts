import type { ChartSettings } from "../types/client/chart";

const DEFAULT_VALUES: ChartSettings = {
  timeframe: 60,
  indicators: [],
  position: {
    showFinished: false,
  },
  klinechart: { mode: "normal" },
  projection: {
    showLines: false,
    showMessages: false,
    showOrderBookLines: false,
    showMovements: false,
    indicators: [],
  },
};
export const CHART_SETTINGS_DF = DEFAULT_VALUES;

export function loadChartSettings(name: string): ChartSettings {
  try {
    const botSettingsString = localStorage.getItem(name);

    if (typeof botSettingsString !== "string") {
      throw Error(`Not valid ${name}`);
    }
    const settings = JSON.parse(botSettingsString);

    return {
      ...DEFAULT_VALUES,
      ...settings,
      projection: { ...DEFAULT_VALUES.projection, ...settings.projection },
    };
  } catch {
    return DEFAULT_VALUES;
  }
}

type PartialUpdateChartSettingsFn = (
  prevSettins: ChartSettings
) => Partial<ChartSettings> | false;
export function partialUpdateChartSettings(
  name: string,
  settings: Partial<ChartSettings> | PartialUpdateChartSettingsFn
) {
  const oldSettings = loadChartSettings(name);
  const newSettings =
    typeof settings === "function" ? settings(oldSettings) : settings;

  if (newSettings === false) {
    return;
  }
  updateChartSettings(name, { ...oldSettings, ...newSettings });
}

export function updateChartSettings(name: string, settings: ChartSettings) {
  localStorage.setItem(name, JSON.stringify(settings));
}
