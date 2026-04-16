import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState, } from "react";
import { Box, Stack, ToggleButton, ToggleButtonGroup, useTheme, } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { init, dispose, } from "klinecharts";
import { loadChartSettings, partialUpdateChartSettings } from "./utils/chart";
import { KLineChartSettingsModal } from "./settings/KLineChartSettingsModal";
import { TIMEFRAMES } from "./constants/app";
import { createTooltipDataSource, getIndicatorStyles } from "./constants/style";
import { IndicatorSelector } from "./components/IndicatorSelector";
import { ChartContext } from "./context/chart";
import { ChartSettingsContext } from "./context/chartSettings";
import { KLineMobile } from "./components/KLineMobile";
import { KLineProjection } from "./projection/KLineProjection";
import { KLineDataLoader } from "./components/KLineDataLoader";
import { KLineChartSidePanel } from "./components/KLineChartSidePanel";
import "./indicators";
import "./overlays";
import "./style.css";
export function KLineChart({ chartSettingName, token, children, timeEndLoader, height = 300, enableRealTime = true, }) {
    const { palette: { mode: themeMode }, } = useTheme();
    const chartEl = useRef(null);
    const controlsRef = useRef(null);
    const [selectedTime, setSelectedTime] = useState(undefined);
    const [chartStore, setChartStore] = useState(null);
    const chartRef = useRef(null);
    const queryClient = useQueryClient();
    const [chartHeight, setChartHeight] = useState(height);
    const [settings, setSettings] = useState(() => loadChartSettings(chartSettingName));
    const { timeframe } = settings;
    const timeframeRef = useRef(timeframe);
    const handleClearSelectedTime = useCallback(() => {
        setSelectedTime(undefined);
    }, []);
    useEffect(() => {
        var _a, _b;
        if (!token || !token.default_trade_group_id || !chartEl.current) {
            return;
        }
        const container = chartEl.current;
        const chart = init(container, {
            decimalFold: {
                threshold: (_a = token.price_precision) !== null && _a !== void 0 ? _a : 8,
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
            pricePrecision: (_b = token.price_precision) !== null && _b !== void 0 ? _b : 8,
            volumePrecision: 2,
        });
        // Set period to trigger initial data load via dataLoader
        // Convert timeframe (in seconds) to period
        const convertTimeframetoPeriod = (timeframeSeconds) => {
            if (timeframeSeconds < 3600) {
                return { type: "minute", span: timeframeSeconds / 60 };
            }
            else if (timeframeSeconds < 86400) {
                return { type: "hour", span: timeframeSeconds / 3600 };
            }
            else {
                return { type: "day", span: timeframeSeconds / 86400 };
            }
        };
        chart.setPeriod(convertTimeframetoPeriod(timeframe));
        chart.subscribeAction("onCandleBarClick", (data) => {
            const { data: info } = data;
            setSelectedTime(info.current.timestamp);
        });
        chart.subscribeAction("onIndicatorTooltipFeatureClick", (data) => {
            const typedData = data;
            const { indicator, feature } = typedData;
            if ((indicator === null || indicator === void 0 ? void 0 : indicator.id) && (feature === null || feature === void 0 ? void 0 : feature.id)) {
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
                            partialUpdateChartSettings(chartSettingName, ({ indicators }) => ({
                                indicators: indicators.filter(({ id }) => id !== indicator.id),
                            }));
                            break;
                        }
                    }
                }
            }
        });
        settings.indicators.forEach((params) => {
            chart.createIndicator({
                ...params.indicator,
                id: params.id,
                createTooltipDataSource,
            }, params.isStack, params.paneOptions);
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
        var _a;
        (_a = chartRef.current) === null || _a === void 0 ? void 0 : _a.setStyles(themeMode);
    }, [themeMode]);
    const handleRefreshSettings = () => {
        setSettings(loadChartSettings(chartSettingName));
    };
    const handleUpdateTimeframe = (timeframe) => {
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
            }
            else {
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
    return (_jsx(ChartSettingsContext.Provider, { value: settings, children: _jsx(ChartContext.Provider, { value: chartStore, children: _jsxs(Box, { sx: {
                    display: "flex",
                    flexDirection: "column"
                }, children: [_jsxs(Box, { ref: controlsRef, children: [_jsx(KLineMobile, {}), _jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: { sx: 0, sm: 1 }, sx: {
                                    alignItems: { xs: "start", sm: "center" }
                                }, children: [_jsx(ToggleButtonGroup, { size: "small", sx: { height: 32 }, color: "primary", value: timeframe, exclusive: true, onChange: (event, newTF) => handleUpdateTimeframe(newTF), children: TIMEFRAMES.map(({ label, value }) => (_jsx(ToggleButton, { value: value, children: label }, value))) }), _jsxs(Stack, { direction: "row", spacing: 1, sx: {
                                            alignItems: "center"
                                        }, children: [_jsx(IndicatorSelector, { chart: chartStore, name: chartSettingName }), _jsx(KLineChartSettingsModal, { name: chartSettingName, onClose: handleRefreshSettings, variant: "position" }), _jsx(KLineChartSettingsModal, { name: chartSettingName, onClose: handleRefreshSettings, variant: "projection" }), token && (_jsx(KLineDataLoader, { timeframe: timeframe, tradeGroupId: token.default_trade_group_id, timeEndLoader: timeEndLoader, symbol: token.symbol, enableRealTime: enableRealTime }))] })] }), token && (_jsx(KLineProjection, { tokenName: token.symbol, symbolId: token.id, timeframe: timeframe, selectedTime: selectedTime, clearSelectedTime: handleClearSelectedTime })), children] }), _jsxs(Stack, { direction: "row", sx: {
                            width: "100%",
                            flex: 1
                        }, children: [_jsx(KLineChartSidePanel, {}), _jsx(Box, { ref: chartEl, sx: {
                                    height: chartHeight,
                                    width: "100%"
                                } })] })] }) }) }));
}
