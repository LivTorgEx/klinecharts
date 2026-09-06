import type {
  ChartSettings,
  ChartSettingsProjectionItem,
} from "../types/client/chart";

const DEFAULT_VALUES: ChartSettings = {
  timeframe: 60,
  indicators: [],
  position: {
    showFinished: false,
  },
  klinechart: { mode: "normal" },
  projection: {
    items: [],
  },
};
export const CHART_SETTINGS_DF = DEFAULT_VALUES;

function normalizeProjectionSettings(
  projection: Partial<ChartSettings["projection"]>
): ChartSettings["projection"] {
  if (Array.isArray(projection.items)) {
    return {
      items: projection.items.filter(
        (item): item is ChartSettingsProjectionItem =>
        !!item && typeof item.id === "string" && !!item.source
      ),
    };
  }
  return { items: [] };
}

function normalizeChartSettings(
  settings: Partial<ChartSettings>
): ChartSettings {
  return {
    ...DEFAULT_VALUES,
    ...settings,
    projection: normalizeProjectionSettings(settings.projection ?? {}),
  };
}

export function loadChartSettings(name: string): ChartSettings {
  try {
    const botSettingsString = localStorage.getItem(name);

    if (typeof botSettingsString !== "string") {
      throw Error(`Not valid ${name}`);
    }
    const settings = JSON.parse(botSettingsString);

    return normalizeChartSettings(settings);
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
