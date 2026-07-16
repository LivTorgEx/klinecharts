import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Box, Stack, useTheme } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  init,
  dispose,
  Chart,
  Crosshair,
  Nullable,
  NeighborData,
  KLineData,
} from "klinecharts";

import { loadChartSettings, partialUpdateChartSettings } from "./utils/chart";
import { createTooltipDataSource, getIndicatorStyles } from "./constants/style";
import { ChartContext } from "./context/chart";
import { ChartSettingsContext } from "./context/chartSettings";
import { useSubscribeProjection } from "./context/dataAdapterContext";
import { SymbolKeyContext } from "./context/symbolKey";
import { KLineChartSidePanel } from "./components/KLineChartSidePanel";
import { KLineCrossSync, SyncedCursor } from "./components/KLineCrossSync";
import { KLineChartHeaderControls } from "./components/KLineChartHeaderControls";
import { KLineChartViewport } from "./components/KLineChartViewport";
import { useTradeIndicator } from "./hooks/api/tradeIndicator";
import type { WebsocketProjectionEvent } from "./types/client/websocket";

import "./indicators";
import "./overlays";
import "./style.css";

type Token = {
  id: number;
  symbol_key: string;
  price_precision?: number;
};
type Props = {
  token?: Token;
  chartSettingName: string;
  height?: number;
  enableRealTime?: boolean;
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
  headerActions,
  onTimestampSelect,
  syncedTimestamp,
}: PropsWithChildren<Props>) {
  const {
    palette: { mode: themeMode },
  } = useTheme();
  const chartEl = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [cursorTime, setCursorTime] = useState<number | undefined>(undefined);
  const [cursorPrice, setCursorPrice] = useState<number | undefined>(undefined);
  const [selectedIndicatorTime, setSelectedIndicatorTime] = useState<
    number | undefined
  >(undefined);
  const [projectionTooltipAnchorEl, setProjectionTooltipAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const subscribeProjection = useSubscribeProjection();
  const [projectionEvent, setProjectionEvent] = useState<
    WebsocketProjectionEvent | undefined
  >(undefined);
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
  const projectionTooltipItems = useMemo(
    () =>
      settings.projection.items.filter((item) => item.placement === "tooltip"),
    [settings.projection.items]
  );
  const tokenId = token?.id;
  const tokenSymbolKey = token?.symbol_key;
  const tokenPricePrecision = token?.price_precision ?? 8;
  const { data: indicatorSnapshot } = useTradeIndicator({
    timeframe,
    time: selectedIndicatorTime,
    symbolKey: tokenSymbolKey,
  });

  useEffect(() => {
    onTimestampSelectRef.current = onTimestampSelect;
  }, [onTimestampSelect]);

  useEffect(() => {
    if (!tokenSymbolKey || !subscribeProjection) {
      return;
    }

    const unsubscribe = subscribeProjection(tokenSymbolKey, setProjectionEvent);
    return () => {
      unsubscribe();
    };
  }, [subscribeProjection, tokenSymbolKey]);

  useEffect(() => {
    if (!tokenId || !tokenSymbolKey || !chartEl.current) {
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

    const setIndicatorTimeFromNeighborData = (
      info: NeighborData<KLineData>
    ) => {
      const timestamp = info.current?.timestamp;
      if (timestamp !== undefined) {
        setSelectedIndicatorTime(timestamp);
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

    chart.subscribeAction("onCandleBarClick", (data) => {
      const { data: info } = data as { data: NeighborData<KLineData> };
      setIndicatorTimeFromNeighborData(info);
    });

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
            case "visible": {
              chart.overrideIndicator({
                id: indicator.id,
                name: ind.name,
                visible: true,
              });
              break;
            }
            case "invisible": {
              chart.overrideIndicator({
                id: indicator.id,
                name: ind.name,
                visible: false,
              });
              break;
            }
            case "close": {
              chart.removeIndicator({ id: indicator.id });
              partialUpdateChartSettings(
                chartSettingName,
                ({ indicators }) => ({
                  indicators: indicators.filter(
                    ({ id }) => id !== indicator.id
                  ),
                })
              );
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
          createTooltipDataSource,
        },
        params.isStack,
        params.paneOptions
      );
    });

    const handleResize = () => {
      chart.resize();
    };

    const handleMouseLeave = () => {
      setCursorTime(undefined);
      setCursorPrice(undefined);
      scheduleEmitCursorSync(null);
    };

    // Listen to window resize
    window.addEventListener("resize", handleResize);
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
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, tokenId, tokenSymbolKey, tokenPricePrecision]);

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
    setSelectedIndicatorTime(undefined);
    setCursorTime(undefined);
    setCursorPrice(undefined);
    setProjectionTooltipAnchorEl(null);
  }, [tokenSymbolKey]);

  useEffect(() => {
    chartRef.current?.setPeriod(convertTimeframeToPeriod(timeframe));
  }, [timeframe]);

  useEffect(() => {
    chartRef.current?.setStyles(themeMode);
  }, [themeMode]);

  const handleRefreshSettings = () => {
    setSettings(loadChartSettings(chartSettingName));
  };
  const handleUpdateTimeframe = (timeframe: number) => {
    partialUpdateChartSettings(chartSettingName, { timeframe });
    handleRefreshSettings();
  };

  const handleProjectionTooltipToggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setProjectionTooltipAnchorEl((current) =>
        current ? null : event.currentTarget
      );
    },
    []
  );

  const handleClearSelectedIndicatorTime = useCallback(() => {
    setSelectedIndicatorTime(undefined);
  }, []);

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
      <ChartSettingsContext.Provider value={settings}>
        <SymbolKeyContext.Provider value={token?.symbol_key ?? ""}>
          <ChartContext.Provider value={chartStore}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box ref={controlsRef}>
                <KLineChartHeaderControls
                  chart={chartStore}
                  chartSettingName={chartSettingName}
                  timeframe={timeframe}
                  tokenSymbolKey={token?.symbol_key}
                  enableRealTime={enableRealTime}
                  timeEndLoader={timeEndLoader}
                  headerActions={headerActions}
                  projectionTooltipItems={projectionTooltipItems}
                  projectionEvent={projectionEvent}
                  indicatorSnapshot={indicatorSnapshot}
                  selectedIndicatorTime={selectedIndicatorTime}
                  onClearSelectedIndicatorTime={
                    handleClearSelectedIndicatorTime
                  }
                  projectionTooltipAnchorEl={projectionTooltipAnchorEl}
                  onUpdateTimeframe={handleUpdateTimeframe}
                  onProjectionTooltipToggle={handleProjectionTooltipToggle}
                  onRefreshSettings={handleRefreshSettings}
                >
                  {children}
                </KLineChartHeaderControls>
              </Box>
              <Stack
                direction="row"
                sx={{
                  width: "100%",
                  flex: 1,
                }}
              >
                <KLineChartSidePanel />
                <KLineChartViewport
                  chartRef={chartEl}
                  chartHeight={chartHeight}
                  tokenPresent={Boolean(token)}
                  items={settings.projection.items}
                  projection={projectionEvent}
                  indicatorSnapshot={indicatorSnapshot}
                />
                <KLineCrossSync
                  chart={chartStore}
                  selectedTime={cursorTime}
                  selectedPrice={cursorPrice}
                  themeMode={themeMode}
                />
              </Stack>
            </Box>
          </ChartContext.Provider>
        </SymbolKeyContext.Provider>
      </ChartSettingsContext.Provider>
    </>
  );
}
