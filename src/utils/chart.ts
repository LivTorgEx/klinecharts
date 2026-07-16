import type {
  ChartSettings,
  ChartSettingsProjectionIndicatorSource,
  ChartSettingsProjectionItem,
  ChartSettingsProjectionPlacement,
  ChartSettingsProjectionSourceProjectionType,
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

type LegacyProjectionSettings = {
  showMessages?: boolean;
  showOrderBookLines?: boolean;
  indicators?: Array<{
    name: ChartSettingsProjectionIndicatorSource["name"];
    properties: Record<string, boolean>;
  }>;
};

const LEGACY_INDICATOR_KEY_MAP: Partial<
  Record<ChartSettingsProjectionIndicatorSource["name"], string>
> = {
  Psar: "psar",
  Smi: "smi_25",
  Lsma: "lsma_50",
  Natr: "natr_14",
  Ema: "ema_20",
  ChandelierExit: "ce",
  BollingerBands: "bb_20",
  ATRTralling: "atrtralling",
  Supertrend: "supertrend",
  Rsi: "rsi_14",
  Mfi: "mfi_14",
  Cci: "cci_20",
  ZigZagTrend: "zigzagtrend",
  Stoch: "stoch_14,1,3",
  Imbalance: "imbalance",
  Mrc: "mrc_200",
  EmaCross: "emacross_9,26",
  Volume: "volume_50",
  Smc: "smc",
  DPSignal: "dpsignal",
  Ntps: "ntps",
  Candle: "candle",
};

function makeProjectionItem(
  id: string,
  placement: ChartSettingsProjectionPlacement,
  source: ChartSettingsProjectionItem["source"]
): ChartSettingsProjectionItem {
  return { id, placement, source };
}

function normalizeProjectionSettings(
  projection: Partial<ChartSettings["projection"]> & LegacyProjectionSettings
): ChartSettings["projection"] {
  if (Array.isArray(projection.items)) {
    return {
      items: projection.items.filter(
        (item): item is ChartSettingsProjectionItem =>
          !!item && typeof item.id === "string" && !!item.source
      ),
    };
  }

  const items: ChartSettingsProjectionItem[] = [];

  if (projection.showMessages) {
    items.push(
      makeProjectionItem("legacy-projection-status", "line1", {
        type: "projection",
        name: "Status" as ChartSettingsProjectionSourceProjectionType,
      }),
      makeProjectionItem("legacy-projection-ntps", "line1", {
        type: "projection",
        name: "NTPS" as ChartSettingsProjectionSourceProjectionType,
      }),
      makeProjectionItem("legacy-projection-trandm", "line1", {
        type: "projection",
        name: "TrandM" as ChartSettingsProjectionSourceProjectionType,
      }),
      makeProjectionItem("legacy-projection-asset", "line1", {
        type: "projection",
        name: "Asset" as ChartSettingsProjectionSourceProjectionType,
      })
    );
  }
  if (projection.showOrderBookLines) {
    items.push(
      makeProjectionItem("legacy-projection-order-book", "line2", {
        type: "projection",
        name: "OrderBook" as ChartSettingsProjectionSourceProjectionType,
      })
    );
  }

  projection.indicators?.forEach((indicator, index) => {
    const key = LEGACY_INDICATOR_KEY_MAP[indicator.name];
    const activeProperties = Object.entries(indicator.properties)
      .filter(([, isActive]) => isActive)
      .map(([property]) => property);
    const properties = activeProperties.length
      ? activeProperties
      : ["Value"];
    properties.forEach((property, propertyIndex) => {
      if (!key) {
        return;
      }
      items.push(
        makeProjectionItem(
          `legacy-indicator-${index}-${propertyIndex}-${indicator.name}-${property}`,
          "tooltip",
          {
            type: "indicator",
            name: indicator.name,
            key,
            property,
          }
        )
      );
    });
  });

  return { items };
}

function normalizeChartSettings(settings: Partial<ChartSettings>): ChartSettings {
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
