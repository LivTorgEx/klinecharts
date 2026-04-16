import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useAccountStrategyNFTWorkerBots } from "../hooks/api/account/strategyNFTWorkerHooks";
import { useChartSettings } from "../context/chartSettings";
import { KLineChartWorkerPositionsWrapper } from "./KLineChartWorkerPositionsWrapper";
import { KLineChartFinishedPositions } from "./KLineChartFinishedPositions";
/**
 * Reusable component for displaying finished and active positions on a chart.
 * Handles fetching completed positions and rendering them alongside active positions.
 */
export function KLineChartWorkerPositionsContent({ workerIdsArray, symbolId, tokenName, showPositions, }) {
    const { position } = useChartSettings();
    const showFinished = showPositions && position.showFinished;
    // Fetch all bots for the worker filtered by symbol
    const { data: workerBots = [] } = useAccountStrategyNFTWorkerBots(showFinished && workerIdsArray.length === 1 ? workerIdsArray[0] : undefined, symbolId);
    // Get bot IDs for this symbol that have finished status
    const botIds = useMemo(() => {
        return workerBots.map((bot) => bot.id);
    }, [workerBots]);
    return (_jsxs(_Fragment, { children: [botIds.map((botId) => (_jsx(KLineChartFinishedPositions, { botId: botId }, `finished-${botId}`))), showPositions && workerIdsArray.length === 1 && (_jsx(KLineChartWorkerPositionsWrapper, { workerIds: workerIdsArray, tokenName: tokenName }))] }));
}
