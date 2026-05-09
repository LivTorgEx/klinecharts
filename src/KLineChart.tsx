import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
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
import { KLineChartSettingsModal } from "./settings/KLineChartSettingsModal";
import { TIMEFRAMES } from "./constants/app";
import { createTooltipDataSource, getIndicatorStyles } from "./constants/style";
import { IndicatorSelector } from "./components/IndicatorSelector";
import { ChartContext } from "./context/chart";
import { ChartSettingsContext } from "./context/chartSettings";
import { SymbolKeyContext } from "./context/symbolKey";
import { KLineMobile } from "./components/KLineMobile";
import { KLineProjection } from "./projection/KLineProjection";
import { KLineDataLoader } from "./components/KLineDataLoader";
import { KLineChartSidePanel } from "./components/KLineChartSidePanel";
import { PositionInfoModalsContainer } from "./components/PositionInfoModalsContainer";
import { KLineCrossSync, SyncedCursor } from "./components/KLineCrossSync";

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
  onTimestampSelect?: (cursor: SyncedCursor | null) => void;
  syncedTimestamp?: SyncedCursor | null;
};

export function KLineChart({
  chartSettingName,
  token,
  children,
  timeEndLoader,
  height = 300,
  enableRealTime = true,
  onTimestampSelect,
  syncedTimestamp,
}: PropsWithChildren<Props>) {
  const {
    palette: { mode: themeMode },
  } = useTheme();
  const chartEl = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(
    undefined
  );
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>(
    undefined
  );
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
  const tokenId = token?.id;
  const tokenSymbolKey = token?.symbol_key;
  const tokenPricePrecision = token?.price_precision ?? 8;
  const timeframeRef = useRef<number>(timeframe);
  const handleClearSelectedTime = useCallback(() => {
    setSelectedTime(undefined);
  }, []);

  useEffect(() => {
    onTimestampSelectRef.current = onTimestampSelect;
  }, [onTimestampSelect]);

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
    const convertTimeframeToPeriod = (timeframeSeconds: number) => {
      if (timeframeSeconds < 3600) {
        return { type: "minute" as const, span: timeframeSeconds / 60 };
      } else if (timeframeSeconds < 86400) {
        return { type: "hour" as const, span: timeframeSeconds / 3600 };
      } else {
        return { type: "day" as const, span: timeframeSeconds / 86400 };
      }
    };
    chart.setPeriod(convertTimeframeToPeriod(timeframe));
    const emitCursorSync = (cursor: SyncedCursor | null) => {
      onTimestampSelectRef.current?.(cursor);
    };

    const syncTimestampFromNeighborData = (info: NeighborData<KLineData>) => {
      const timestamp = info.current?.timestamp;
      const price = info.current?.close;
      if (timestamp !== undefined && price !== undefined) {
        emitCursorSync({
          timestamp,
          price,
          source: chartSettingName,
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

      emitCursorSync({
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
      syncTimestampFromNeighborData(info);
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
      setSelectedTime(undefined);
      setSelectedPrice(undefined);
      emitCursorSync(null);
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
      setSelectedTime(undefined);
      setSelectedPrice(undefined);
      return;
    }

    setSelectedTime((prev) =>
      prev === syncedTimestamp.timestamp ? prev : syncedTimestamp.timestamp
    );
    setSelectedPrice((prev) =>
      prev === syncedTimestamp.price ? prev : syncedTimestamp.price
    );
  }, [chartSettingName, syncedTimestamp]);

  useEffect(() => {
    timeframeRef.current = timeframe;
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
                <KLineMobile />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ sx: 0, sm: 1 }}
                  sx={{
                    alignItems: { xs: "start", sm: "center" },
                  }}
                >
                  <ToggleButtonGroup
                    size="small"
                    sx={{ height: 32 }}
                    color="primary"
                    value={timeframe}
                    exclusive
                    onChange={(event, newTF) => handleUpdateTimeframe(newTF)}
                  >
                    {TIMEFRAMES.map(({ label, value }) => (
                      <ToggleButton key={value} value={value} sx={{borderRadius: 0}}>
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <IndicatorSelector
                      chart={chartStore}
                      name={chartSettingName}
                    />
                    <KLineChartSettingsModal
                      name={chartSettingName}
                      onClose={handleRefreshSettings}
                      variant="position"
                    />
                    <KLineChartSettingsModal
                      name={chartSettingName}
                      onClose={handleRefreshSettings}
                      variant="projection"
                    />
                    {token?.symbol_key && (
                      <KLineDataLoader
                        timeframe={timeframe}
                        symbolKey={token.symbol_key}
                        timeEndLoader={timeEndLoader}
                        symbol={token.symbol_key}
                        enableRealTime={enableRealTime}
                      />
                    )}
                  </Stack>
                </Stack>
                {token && (
                  <KLineProjection
                    tokenName={token.symbol_key}
                    symbolId={token.id}
                    timeframe={timeframe}
                    selectedTime={selectedTime}
                    clearSelectedTime={handleClearSelectedTime}
                  />
                )}
                {children}
              </Box>
              <Stack
                direction="row"
                sx={{
                  width: "100%",
                  flex: 1,
                }}
              >
                <KLineChartSidePanel />
                <Box
                  ref={chartEl}
                  sx={{
                    height: chartHeight,
                    width: "100%",
                  }}
                />
                <KLineCrossSync
                  chart={chartStore}
                  selectedTime={selectedTime}
                  selectedPrice={selectedPrice}
                  themeMode={themeMode}
                />
              </Stack>
            </Box>
          </ChartContext.Provider>
        </SymbolKeyContext.Provider>
      </ChartSettingsContext.Provider>
      <PositionInfoModalsContainer />
    </>
  );
}
