import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useSymbol } from "../hooks/api/symbolHooks";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";
function KLineChartBotContent({ botId, token }) {
    const { position } = useChartSettings();
    return (_jsxs(_Fragment, { children: [position.showFinished && _jsx(KLineChartFinishedPositions, { botId: botId }), _jsx(KLineChartProgressPositions, { botId: botId, tokenName: token.symbol })] }));
}
export function KLineChartPosition({ botId, tokenId }) {
    const token = useSymbol(tokenId);
    return (_jsx(KLineChart, { token: token, chartSettingName: "Position", children: token && _jsx(KLineChartBotContent, { token: token, botId: botId }) }));
}
