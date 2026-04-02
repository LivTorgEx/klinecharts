import { jsx as _jsx } from "react/jsx-runtime";
import { useSymbol } from "../hooks/api/symbolHooks";
import { KLineChart } from "./KLineChart";
export function KLineChartSymbol({ symbolId, children }) {
    const token = useSymbol(symbolId);
    return (_jsx(KLineChart, { token: token, chartSettingName: "Symbol", height: 600, children: children }));
}
