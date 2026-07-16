import { useQuery } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../../context/dataAdapterContext";
import { useSymbolKey } from "../../context/symbolKey";

type TradeIndicatorParams = {
  timeframe: number;
  time?: number;
  symbolKey?: string;
  indicatorName?: string;
};

type TradeIndicatorData = {
  id: number;
  time: number;
  indicators: Record<string, Record<string, string | number>>;
};

export function useTradeIndicator(params: TradeIndicatorParams) {
  const adapter = useKLineChartDataAdapter();
  const symbolKey = params.symbolKey ?? useSymbolKey();

  return useQuery<TradeIndicatorData | undefined>({
    queryKey: [
      "ProjectionIndicators",
      symbolKey,
      params.timeframe,
      params.time,
      params.indicatorName ?? null,
    ],
    queryFn: async () => {
      if (!adapter.loadProjectionIndicators || !symbolKey) {
        return undefined;
      }

      return adapter.loadProjectionIndicators({
        symbolKey,
        timeframe: params.timeframe,
        time: params.time,
        indicatorName: params.indicatorName,
        limit: 1,
      }).then((result) => result ?? undefined);
    },
    enabled: Boolean(symbolKey && adapter.loadProjectionIndicators),
    refetchInterval: params.time ? false : Math.max(params.timeframe * 1000, 1_000),
  });
}
