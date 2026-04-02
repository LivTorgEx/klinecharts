import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { useAccountStrategyNFTPositions } from "../../hooks/api/account/strategyNFTWorkerPositionHooks";
import { useSymbols } from "../../hooks/api/symbolHooks";
import { KLineChartProgressPositions } from "./KLineChartProgressPositions";
export function KLineChartWorkerPositionsWrapper({ workerIds, tokenName, }) {
    const { data: symbols = [] } = useSymbols();
    const currentSymbol = symbols.find((s) => s.symbol === tokenName);
    // Render a separate worker position component for each worker
    return (_jsx(_Fragment, { children: workerIds.map((workerId) => (_jsx(WorkerPositionsRenderer, { workerId: workerId, tokenName: tokenName, currentSymbol: currentSymbol }, workerId))) }));
}
// Helper component to fetch and render positions for a single worker
function WorkerPositionsRenderer({ workerId, tokenName, currentSymbol, }) {
    const { data: workerPositions } = useAccountStrategyNFTPositions(workerId, {
        status: ["Created", "InProgress", "Finishing"],
    }, { page: 0, page_size: 100 });
    const uniqueBotIds = useMemo(() => {
        if (!(workerPositions === null || workerPositions === void 0 ? void 0 : workerPositions.data) || !currentSymbol)
            return [];
        const botIdsSet = new Set();
        workerPositions.data
            .filter((position) => position.symbol_id === currentSymbol.id)
            .forEach((position) => botIdsSet.add(position.bot_id));
        return Array.from(botIdsSet);
    }, [workerPositions, currentSymbol]);
    // Render KLineChartProgressPositions for each unique bot_id
    return (_jsx(_Fragment, { children: uniqueBotIds.map((botId) => (_jsx(KLineChartProgressPositions, { botId: botId, tokenName: tokenName }, botId))) }));
}
