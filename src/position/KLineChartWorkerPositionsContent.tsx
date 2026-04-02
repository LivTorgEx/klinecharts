import { useMemo } from "react";
import { useAccountStrategyNFTWorkerBots } from "../../hooks/api/account/strategyNFTWorkerHooks";
import { useChartSettings } from "../context/chartSettings";
import { KLineChartWorkerPositionsWrapper } from "./KLineChartWorkerPositionsWrapper";
import { KLineChartFinishedPositions } from "./KLineChartFinishedPositions";

interface KLineChartWorkerPositionsContentProps {
  workerIdsArray: number[];
  symbolId: number;
  tokenName: string;
  showPositions: boolean;
}

/**
 * Reusable component for displaying finished and active positions on a chart.
 * Handles fetching completed positions and rendering them alongside active positions.
 */
export function KLineChartWorkerPositionsContent({
  workerIdsArray,
  symbolId,
  tokenName,
  showPositions,
}: KLineChartWorkerPositionsContentProps) {
  const { position } = useChartSettings();

  const showFinished = showPositions && position.showFinished;
  // Fetch all bots for the worker filtered by symbol
  const { data: workerBots = [] } = useAccountStrategyNFTWorkerBots(
    showFinished && workerIdsArray.length === 1 ? workerIdsArray[0] : undefined,
    symbolId
  );

  // Get bot IDs for this symbol that have finished status
  const botIds = useMemo(() => {
    return workerBots.map((bot: { id: number }) => bot.id);
  }, [workerBots]);

  return (
    <>
      {botIds.map((botId) => (
        <KLineChartFinishedPositions key={`finished-${botId}`} botId={botId} />
      ))}
      {showPositions && workerIdsArray.length === 1 && (
        <KLineChartWorkerPositionsWrapper
          workerIds={workerIdsArray}
          tokenName={tokenName}
        />
      )}
    </>
  );
}
