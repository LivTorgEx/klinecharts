import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { init, dispose, Chart, Crosshair, Nullable } from "klinecharts";

import { loadChartSettings, partialUpdateChartSettings } from "./utils/chart";
import { createTooltipDataSource, getIndicatorStyles } from "./constants/style";
import { ChartContext } from "./context/chart";
import { ChartSettingsContext } from "./context/chartSettings";
import { SymbolKeyContext } from "./context/symbolKey";
import { KLineCrossSync, SyncedCursor } from "./components/KLineCrossSync";
import { KLineChartHeaderControls } from "./components/KLineChartHeaderControls";
import { KLineChartViewport } from "./components/KLineChartViewport";
import { KLineChartSidePanel } from "./components/KLineChartSidePanel";
import { KLineChartMarketDecisionProvider } from "./context/marketDecision";

import "./indicators";
import "./overlays";

type Token = {
  symbol_key: string;
  market_data_symbol_key?: string;
  price_precision?: number;
};
type Props = {
  token?: Token;
  chartSettingName: string;
  height?: number;
  enableRealTime?: boolean;
  chartInfo?: ReactNode;
  timeEndLoader?: number;
  headerActions?: ReactNode;
  onTimestampSelect?: (cursor: SyncedCursor | null) => void;
  syncedTimestamp?: SyncedCursor | null;
};

function convertTimeframeToPeriod(timeframeSeconds: number) {
  if (timeframeSeconds < 3600) {
    return { type: "minute" as const, span: timeframeSeconds / 60 };
  }
  if (timeframeSeconds < 86400) {
    return { type: "hour" as const, span: timeframeSeconds / 3600 };
  }
  return { type: "day" as const, span: timeframeSeconds / 86400 };
}

export function KLineChart({
  chartSettingName,
  token,
  children,
  timeEndLoader,
  height = 300,
  enableRealTime = true,
  chartInfo,
  headerActions,
  onTimestampSelect,
  syncedTimestamp,
}: PropsWithChildren<Props>) {
  const themeMode = "dark" as const;
  const chartEl = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [cursorTime, setCursorTime] = useState<number | undefined>(undefined);
  const [cursorPrice, setCursorPrice] = useState<number | undefined>(undefined);
  const [editIndicatorId, setEditIndicatorId] = useState<string | null>(null);
  const [chartStore, setChartStore] = useState<Nullable<Chart>>(null);
  const chartRef = useRef<Nullable<Chart>>(null);
  const onTimestampSelectRef =
    useRef<typeof onTimestampSelect>(onTimestampSelect);
  const queryClient = useQueryClient();
  const [chartHeight, setChartHeight] = useState(height);

  const [settings, setSettings] = useState(() =>
    loadChartSettings(chartSettingName)
  );
  const { timeframe } = settings;
  const tokenSymbolKey = token?.symbol_key;
  const tokenMarketDataSymbolKey =
    token?.market_data_symbol_key ?? tokenSymbolKey;
  const tokenPricePrecision = token?.price_precision ?? 8;
  useEffect(() => {
    onTimestampSelectRef.current = onTimestampSelect;
  }, [onTimestampSelect]);

  useEffect(() => {
    if (!tokenSymbolKey || !chartEl.current) {
      return;
    }

    const container = chartEl.current;
    const chart = init(container, {
      decimalFold: {
        threshold: tokenPricePrecision,
      },
    });
    chartRef.current = chart;
    setChartStore(chart);

    if (!chart) {
      return;
    }

    const color = themeMode === "dark" ? "#929AA5" : "#76808F";
    chart.setStyles({
      indicator: getIndicatorStyles(color),
    });

    chart.setStyles(themeMode);
    chart.setSymbol({
      ticker: token!.symbol_key,
      pricePrecision: tokenPricePrecision,
      volumePrecision: 2,
    });
    chart.setPeriod(convertTimeframeToPeriod(timeframe));
    const emitCursorSync = (cursor: SyncedCursor | null) => {
      onTimestampSelectRef.current?.(cursor);
    };

    let syncRafId: number | undefined;
    let pendingCursor: SyncedCursor | null | undefined;
    let lastEmittedTimestamp: number | undefined;

    const scheduleEmitCursorSync = (cursor: SyncedCursor | null) => {
      pendingCursor = cursor;
      if (syncRafId === undefined) {
        syncRafId = requestAnimationFrame(() => {
          syncRafId = undefined;
          if (pendingCursor !== undefined) {
            const newTs = pendingCursor?.timestamp;
            if (newTs !== lastEmittedTimestamp) {
              lastEmittedTimestamp = newTs;
              emitCursorSync(pendingCursor);
            }
            pendingCursor = undefined;
          }
        });
      }
    };

    const syncTimestamp = (
      timestamp: number | undefined,
      price: number | undefined
    ) => {
      if (!timestamp || price === undefined) {
        return;
      }

      scheduleEmitCursorSync({
        timestamp,
        price,
        source: chartSettingName,
      });
    };

    const getCursorFromCrosshair = (crosshair: Crosshair) => {
      if (crosshair.x === undefined || crosshair.y === undefined) {
        return undefined;
      }

      const converted = chart.convertFromPixel(
        [
          {
            x: crosshair.x,
            y: crosshair.y,
          },
        ],
        crosshair.paneId ? { paneId: crosshair.paneId } : undefined
      ) as Array<Partial<{ timestamp: number; value: number }>>;

      const point = converted[0];
      if (point?.timestamp === undefined || point.value === undefined) {
        return undefined;
      }

      return {
        timestamp: point.timestamp,
        price: point.value,
      };
    };

    chart.subscribeAction("onCrosshairChange", (data) => {
      const crosshairPayload = data as Crosshair;
      const resolvedCursor = getCursorFromCrosshair(crosshairPayload);
      if (resolvedCursor) {
        syncTimestamp(resolvedCursor.timestamp, resolvedCursor.price);
      }
    });

    chart.subscribeAction("onIndicatorTooltipFeatureClick", (data: unknown) => {
      const typedData = data as {
        indicator: { id: string; name: string };
        feature: { id: string };
      };
      const { indicator, feature } = typedData;
      if (indicator?.id && feature?.id) {
        // Get the indicator to find its name
        const indicators = chart.getIndicators({ id: indicator.id });
        if (indicators.length > 0) {
          const ind = indicators[0];
          switch (feature.id) {
            case "visible":
            case "invisible": {
              const visible = feature.id === "visible";
              chart.overrideIndicator({
                id: indicator.id,
                name: ind.name,
                visible,
              });
              partialUpdateChartSettings(chartSettingName, (previous) => ({
                indicators: previous.indicators.map((item) =>
                  item.id === indicator.id
                    ? {
                        ...item,
                        indicator: { ...item.indicator, visible },
                      }
                    : item
                ),
              }));
              window.dispatchEvent(
                new CustomEvent("klinechart:settings-updated", {
                  detail: { name: chartSettingName },
                })
              );
              break;
            }
            case "close": {
              chart.removeIndicator({ id: indicator.id });
              setEditIndicatorId((current) =>
                current === indicator.id ? null : current
              );
              partialUpdateChartSettings(
                chartSettingName,
                ({ indicators }) => ({
                  indicators: indicators.filter(
                    ({ id }) => id !== indicator.id
                  ),
                })
              );
              window.dispatchEvent(
                new CustomEvent("klinechart:settings-updated", {
                  detail: { name: chartSettingName },
                })
              );
              break;
            }
            case "edit": {
              setEditIndicatorId(indicator.id);
              break;
            }
          }
        }
      }
    });

    settings.indicators.forEach((params) => {
      chart.createIndicator(
        {
          ...params.indicator,
          id: params.id,
          ...(params.paneOptions?.id
            ? { paneId: params.paneOptions.id }
            : {}),
          createTooltipDataSource,
        },
        params.isStack
      );
    });

    const handleResize = () => {
      chart.resize();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Browsers can pause canvas rendering while this tab is hidden.
        chart.resize();
      }
    };

    const handleMouseLeave = () => {
      setCursorTime(undefined);
      setCursorPrice(undefined);
      scheduleEmitCursorSync(null);
    };

    // Listen to window resize
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Listen to container resize (for parent component resizes)
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);

    return () => {
      if (syncRafId !== undefined) {
        cancelAnimationFrame(syncRafId);
      }
      dispose(chart);
      chartRef.current = null;
      setChartStore(null);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, tokenSymbolKey, tokenPricePrecision]);

  useEffect(() => {
    if (syncedTimestamp === null || syncedTimestamp === undefined) {
      return;
    }

    if (syncedTimestamp.source === chartSettingName) {
      setCursorTime(undefined);
      setCursorPrice(undefined);
      return;
    }

    setCursorTime((prev) =>
      prev === syncedTimestamp.timestamp ? prev : syncedTimestamp.timestamp
    );
    setCursorPrice((prev) =>
      prev === syncedTimestamp.price ? prev : syncedTimestamp.price
    );
  }, [chartSettingName, syncedTimestamp]);

  useEffect(() => {
    setCursorTime(undefined);
    setCursorPrice(undefined);
    setEditIndicatorId(null);
  }, [chartSettingName, tokenSymbolKey]);

  useEffect(() => {
    chartRef.current?.setPeriod(convertTimeframeToPeriod(timeframe));
  }, [timeframe]);

  useEffect(() => {
    chartRef.current?.setStyles(themeMode);
  }, [themeMode]);

  useEffect(() => {
    const handleSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ name?: string }>).detail;
      if (detail?.name === chartSettingName) {
        setSettings(loadChartSettings(chartSettingName));
      }
    };
    window.addEventListener(
      "klinechart:settings-updated",
      handleSettingsUpdated
    );
    return () =>
      window.removeEventListener(
        "klinechart:settings-updated",
        handleSettingsUpdated
      );
  }, [chartSettingName]);

  // Calculate available height for chart
  useEffect(() => {
    const updateChartHeight = () => {
      if (controlsRef.current) {
        const controlsHeight = controlsRef.current.clientHeight;
        const availableHeight = height - controlsHeight;
        setChartHeight(Math.max(availableHeight, 200)); // minimum 200px
      } else {
        setChartHeight(height);
      }
    };

    updateChartHeight();

    // Observe controls size changes (when content is added/removed)
    if (controlsRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        updateChartHeight();
      });
      resizeObserver.observe(controlsRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [height]);

  return (
    <>
      <KLineChartMarketDecisionProvider
        symbolKey={tokenSymbolKey}
        marketDataSymbolKey={tokenMarketDataSymbolKey}
        enabled={enableRealTime}
      >
        <ChartSettingsContext.Provider value={settings}>
          <SymbolKeyContext.Provider value={token?.symbol_key ?? ""}>
            <ChartContext.Provider value={chartStore}>
              <div className="flex min-w-0 flex-col">
                <div ref={controlsRef}>
                  <KLineChartHeaderControls
                    chart={chartStore}
                    chartSettingName={chartSettingName}
                    timeframe={timeframe}
                    tokenSymbolKey={token?.symbol_key}
                    tokenMarketDataSymbolKey={tokenMarketDataSymbolKey}
                    enableRealTime={enableRealTime}
                    timeEndLoader={timeEndLoader}
                    headerActions={headerActions}
                    editIndicatorId={editIndicatorId}
                    onEditIndicatorComplete={() => setEditIndicatorId(null)}
                  >
                    {children}
                  </KLineChartHeaderControls>
                </div>
                <div className="flex w-full flex-1">
                  <KLineChartSidePanel />
                  <KLineChartViewport
                    chartRef={chartEl}
                    chartHeight={chartHeight}
                    tokenPresent={Boolean(token)}
                    chartInfo={chartInfo}
                  />
                  <KLineCrossSync
                    chart={chartStore}
                    selectedTime={cursorTime}
                    selectedPrice={cursorPrice}
                    themeMode={themeMode}
                  />
                </div>
              </div>
            </ChartContext.Provider>
          </SymbolKeyContext.Provider>
        </ChartSettingsContext.Provider>
      </KLineChartMarketDecisionProvider>
    </>
  );
}
