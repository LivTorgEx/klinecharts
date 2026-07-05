import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../../context/dataAdapterContext";
import { KLineChartLoadBotPositionsParams } from "../../types/client/dataAdapter";
import { KLineChartPosition } from "../../types/client/klinechart";

type BotPositionsResult = {
  data: KLineChartPosition[];
};

export function useBotPositions(
  filter?: KLineChartLoadBotPositionsParams,
  priority: "critical" | "default" = "default"
) {
  const adapter = useKLineChartDataAdapter();

  return useQuery<BotPositionsResult>({
    queryKey: [
      "BotPositions",
      priority,
      filter?.status ?? null,
      filter ?? null,
      null,
    ],
    queryFn: () => adapter.loadBotPositions!(filter ?? {}),
    placeholderData: keepPreviousData,
    enabled: Boolean(adapter.loadBotPositions),
  });
}
