import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Close } from "@mui/icons-material";
import { format } from "date-fns";
import { IconButton, Stack, Typography } from "@mui/material";
import { useTradeIndicator } from "../hooks/api/tradeIndicator";
import { useChartSettings } from "../context/chartSettings";
import { DATETIME_UI } from "../constants/date";
const INDICATOR_MAP = {
    ZigZagTrend: ["zigzagtrend"],
    ATRTralling: ["atrtralling"],
    BollingerBands: ["bb_20"],
    Candle: ["candle"],
    Cci: ["cci_20"],
    ChandelierExit: ["cc"],
    Ema: ["ema_20", "ema_200"],
    Imbalance: ["imbalance"],
    Lsma: ["lsma_50"],
    Mfi: ["mfi_14"],
    Mrc: ["mrc_200"],
    Natr: ["natr_14", "natr_30"],
    Psar: ["psar"],
    Rsi: ["rsi_14"],
    Smi: ["smi_10", "smi_25"],
    Stoch: ["stoch_14,1,3"],
    Supertrend: ["supertrend"],
    Wave: ["wave"],
    EmaCross: ["emacross_9,26"],
    Window: ["window"],
    Smc: ["smc"],
    DPSignal: ["dpsignal"],
    Volume: ["volume_50"],
    Ntps: ["ntps"],
};
export function KLinePropjectionIndicators({ symbolId, timeframe, selectedTime, clearSelectedTime, }) {
    const { projection: { indicators }, } = useChartSettings();
    const { data: indicator } = useTradeIndicator({
        symbol_id: symbolId,
        timeframe,
        time: selectedTime,
    });
    if (!indicator) {
        return null;
    }
    const values = indicator.indicators;
    return (_jsxs(Stack, { children: [selectedTime && (_jsxs(Typography, { variant: "caption", children: ["Selected time: ", format(selectedTime, DATETIME_UI), " ", _jsx(IconButton, { color: "error", size: "small", onClick: clearSelectedTime, children: _jsx(Close, { fontSize: "inherit" }) })] })), indicators.map(({ name, properties }) => (_jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Typography, { variant: "caption", children: name }), _jsx(Stack, { children: INDICATOR_MAP[name]?.map((key) => values[key] ? (_jsxs(Stack, { direction: "row", useFlexGap: true, sx: {
                                flexWrap: "wrap"
                            }, children: [_jsxs(Typography, { variant: "caption", sx: {
                                        mr: 1
                                    }, children: ["(", key, ")"] }), Object.entries(properties)
                                    .filter(([, isActive]) => isActive)
                                    .map(([propertyName]) => (_jsxs(Typography, { variant: "caption", sx: {
                                        mr: 1
                                    }, children: [propertyName, ": ", values[key][propertyName]] }, propertyName)))] }, key)) : (_jsx(Typography, { variant: "caption", children: "Not found" }, key))) })] }, name)))] }));
}
