import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../../context/dataAdapterContext";
import {
  KLineChartBotPosition,
  KLineChartLoadBotPositionsParams,
} from "../../types/client/dataAdapter";

type BotPositionsResult = {
  data: KLineChartBotPosition[];
};

export function useBotPositions(filter?: KLineChartLoadBotPositionsParams) {
  const adapter = useKLineChartDataAdapter();

  return useQuery<BotPositionsResult>({
    queryKey: ["BotPositions", filter],
    queryFn: () => adapter.loadBotPositions!(filter ?? {}),
    placeholderData: keepPreviousData,
    enabled: Boolean(adapter.loadBotPositions),
  });
}
