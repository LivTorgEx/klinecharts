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

import "./indicators";
import "./overlays";
import "./style.css";

type Token = {
  id: number;
  symbol: string;
  symbol_key?: string;
  price_precision?: number;
};
type Props = {
  token?: Token;
  chartSettingName: string;
  height?: number;
  enableRealTime?: boolean;
  timeEndLoader?: number;
};

export function KLineChart({
  chartSettingName,
  token,
  children,
  timeEndLoader,
  height = 300,
  enableRealTime = true,
}: PropsWithChildren<Props>) {
  const {
    palette: { mode: themeMode },
  } = useTheme();
  const chartEl = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(
    undefined
  );
  const [chartStore, setChartStore] = useState<Nullable<Chart>>(null);
  const chartRef = useRef<Nullable<Chart>>(null);
  const queryClient = useQueryClient();
  const [chartHeight, setChartHeight] = useState(height);

  const [settings, setSettings] = useState(() =>
    loadChartSettings(chartSettingName)
  );
  const { timeframe } = settings;
  const timeframeRef = useRef<number>(timeframe);
  const handleClearSelectedTime = useCallback(() => {
    setSelectedTime(undefined);
  }, []);

  useEffect(() => {
    if (!token || !token.symbol_key || !chartEl.current) {
      if (token && !token.symbol_key) {
        console.error(`[KLineChart] token has no symbol_key`, token);
      }
      return;
    }

    const container = chartEl.current;
    const chart = init(container, {
      decimalFold: {
        threshold: token.price_precision ?? 8,
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
      ticker: token.symbol,
      pricePrecision: token.price_precision ?? 8,
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
    chart.subscribeAction("onCandleBarClick", (data) => {
      const { data: info } = data as { data: NeighborData<KLineData> };
      setSelectedTime(info.current.timestamp);
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

    // Listen to window resize
    window.addEventListener("resize", handleResize);

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
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, token]);

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
                    <ToggleButton key={value} value={value}>
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
                      symbol={token.symbol}
                      enableRealTime={enableRealTime}
                    />
                  )}
                </Stack>
              </Stack>
              {token && (
                <KLineProjection
                  tokenName={token.symbol}
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
            </Stack>
          </Box>
        </ChartContext.Provider>
        </SymbolKeyContext.Provider>
      </ChartSettingsContext.Provider>
      <PositionInfoModalsContainer />
    </>
  );
}
