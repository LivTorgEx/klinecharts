import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useSymbol } from "./hooks/api/symbolHooks";
import { useChartSettings } from "./context/chartSettings";
import { KLineChart } from "./KLineChart";
import { KLineChartFinishedPositions } from "./position/KLineChartFinishedPositions";
import { KLineChartProgressPositions } from "./position/KLineChartProgressPositions";
function KLineChartBotContent({ bot, token }) {
    const { position } = useChartSettings();
    return (_jsxs(_Fragment, { children: [position.showFinished && _jsx(KLineChartFinishedPositions, { botId: bot.id }), _jsx(KLineChartProgressPositions, { botId: bot.id, tokenName: token.symbol })] }));
}
export function KLineChartBot({ bot }) {
    const token = useSymbol(bot.symbol_id);
    return (_jsx(KLineChart, { token: token, chartSettingName: "Bot", height: 600, children: token && _jsx(KLineChartBotContent, { token: token, bot: bot }) }));
}
