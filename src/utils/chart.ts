import type { ChartSettings } from "../types/client/chart";
import { TIMEFRAMES } from "../constants/app";

const DEFAULT_VALUES: ChartSettings = {
  schemaVersion: 1,
  timeframe: 60,
  indicators: [],
  orderBook: {
    show: true,
  },
  position: {
    showFinished: false,
  },
  klinechart: { mode: "normal" },
};
export const CHART_SETTINGS_DF = DEFAULT_VALUES;

function normalizeChartSettings(
  settings: Partial<ChartSettings>
): ChartSettings {
  const timeframe =
    typeof settings.timeframe === "number" &&
    TIMEFRAMES.some(({ value }) => value === settings.timeframe)
      ? settings.timeframe
      : DEFAULT_VALUES.timeframe;

  return {
    schemaVersion: 1,
    timeframe,
    indicators: Array.isArray(settings.indicators)
      ? settings.indicators.filter(
          (item) =>
            !!item &&
            typeof item.id === "string" &&
            !!item.indicator &&
            typeof item.indicator.name === "string" &&
            (item.indicator.calcParams === undefined ||
              (Array.isArray(item.indicator.calcParams) &&
                item.indicator.calcParams.every(
                  (value) => typeof value === "number" && Number.isFinite(value)
                ))) &&
            typeof item.isStack === "boolean"
        )
      : DEFAULT_VALUES.indicators,
    orderBook:
      settings.orderBook && typeof settings.orderBook.show === "boolean"
        ? { show: settings.orderBook.show }
        : DEFAULT_VALUES.orderBook,
    position:
      settings.position && typeof settings.position.showFinished === "boolean"
        ? { showFinished: settings.position.showFinished }
        : DEFAULT_VALUES.position,
    klinechart:
      settings.klinechart &&
      ["normal", "weak_magnet", "strong_magnet"].includes(
        settings.klinechart.mode
      )
        ? settings.klinechart
        : DEFAULT_VALUES.klinechart,
  };
}

export function loadChartSettings(name: string): ChartSettings {
  try {
    const botSettingsString = localStorage.getItem(name);

    if (typeof botSettingsString !== "string") {
      throw Error(`Not valid ${name}`);
    }
    const settings: unknown = JSON.parse(botSettingsString);

    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return DEFAULT_VALUES;
    }

    const parsedVersion = (settings as { schemaVersion?: unknown })
      .schemaVersion;
    if (parsedVersion !== undefined && parsedVersion !== 1) {
      return DEFAULT_VALUES;
    }

    // Unversioned settings are the previous format; normalization is its v1 migration.
    return normalizeChartSettings(settings as Partial<ChartSettings>);
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
