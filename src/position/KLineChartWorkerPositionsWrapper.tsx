import { useMemo } from "react";

import { useAccountStrategyNFTPositions } from "../../hooks/api/account/strategyNFTWorkerPositionHooks";
import { useSymbols } from "../../hooks/api/symbolHooks";
import { KLineChartProgressPositions } from "./KLineChartProgressPositions";
import { SymbolType } from "../../types/client/symbol";

type Props = {
  workerIds: number[];
  tokenName: string;
};

export function KLineChartWorkerPositionsWrapper({
  workerIds,
  tokenName,
}: Props) {
  const { data: symbols = [] } = useSymbols();
  const currentSymbol = symbols.find((s) => s.symbol === tokenName);

  // Render a separate worker position component for each worker
  return (
    <>
      {workerIds.map((workerId) => (
        <WorkerPositionsRenderer
          key={workerId}
          workerId={workerId}
          tokenName={tokenName}
          currentSymbol={currentSymbol}
        />
      ))}
    </>
  );
}

// Helper component to fetch and render positions for a single worker
function WorkerPositionsRenderer({
  workerId,
  tokenName,
  currentSymbol,
}: {
  workerId: number;
  tokenName: string;
  currentSymbol: SymbolType | undefined;
}) {
  const { data: workerPositions } = useAccountStrategyNFTPositions(
    workerId,
    {
      status: ["Created", "InProgress", "Finishing"],
    },
    { page: 0, page_size: 100 }
  );

  const uniqueBotIds = useMemo(() => {
    if (!workerPositions?.data || !currentSymbol) return [];

    const botIdsSet = new Set<number>();
    workerPositions.data
      .filter((position) => position.symbol_id === currentSymbol.id)
      .forEach((position) => botIdsSet.add(position.bot_id));

    return Array.from(botIdsSet);
  }, [workerPositions, currentSymbol]);

  // Render KLineChartProgressPositions for each unique bot_id
  return (
    <>
      {uniqueBotIds.map((botId) => (
        <KLineChartProgressPositions
          key={botId}
          botId={botId}
          tokenName={tokenName}
        />
      ))}
    </>
  );
}
