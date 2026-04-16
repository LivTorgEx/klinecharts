import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useChartSettings } from "../context/chartSettings";
import { KLineProjectionLines } from "./KLineProjectionLines";
import { KLineProjectionMessages } from "./KLineProjectionMessages";
import { KLineProjectionMovements } from "./KLineProjectionMovements";
import { KLineProjectionOrderBook } from "./KLineProjectionOrderBook";
import { KLinePropjectionIndicators } from "./KLinePropjectionIndicators";
export function KLineProjection({ tokenName, symbolId, timeframe, selectedTime, clearSelectedTime, }) {
    const { projection } = useChartSettings();
    return (_jsxs(_Fragment, { children: [projection.showMessages && (_jsx(KLineProjectionMessages, { tokenName: tokenName })), projection.showOrderBookLines && (_jsx(KLineProjectionOrderBook, { tokenName: tokenName })), projection.showLines && (_jsx(KLineProjectionLines, { symbolId: symbolId, timeframe: timeframe })), projection.showMovements && (_jsx(KLineProjectionMovements, { tokenName: tokenName })), !!projection.indicators &&
                !!Object.keys(projection.indicators).length && (_jsx(KLinePropjectionIndicators, { symbolId: symbolId, timeframe: timeframe, selectedTime: selectedTime, clearSelectedTime: clearSelectedTime }))] }));
}
