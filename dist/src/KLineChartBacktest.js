import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useSymbolFromAll, useSymbolsAll } from "./hooks/api/symbolHooks";
import { KLineChart } from "./KLineChart";
import { KLineChartBacktestPositions } from "./position/KLineChartBacktestPositions";
import { KLineChartLoadDebug } from "./components/KLineChartLoadDebug";
export function KLineChartBacktest({ backtestRun, timeEndLoader }) {
    var _a;
    const { data: symbols = [] } = useSymbolsAll();
    const symbol = useMemo(() => symbols.find((symbol) => symbol.default_trade_group_id === backtestRun.trade_group_id), [backtestRun, symbols]);
    const token = useSymbolFromAll(symbol === null || symbol === void 0 ? void 0 : symbol.id);
    if (!token) {
        return null;
    }
    return (_jsxs(KLineChart, { token: token, chartSettingName: "backtest", timeEndLoader: timeEndLoader, enableRealTime: false, height: 600, children: [window.location.hostname === "localhost" && (_jsx(KLineChartLoadDebug, { backtestRunId: backtestRun.id })), _jsx(KLineChartBacktestPositions, { positions: (_a = backtestRun.positions) !== null && _a !== void 0 ? _a : [] })] }));
}
