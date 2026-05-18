import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../../context/dataAdapterContext";

export const CHART_ALERTS_QUERY_KEY = "Account/Alerts";

export function useChartAlerts(symbolKey: string) {
  const adapter = useKLineChartDataAdapter();

  return useQuery({
    queryKey: [CHART_ALERTS_QUERY_KEY, { symbolKey, source: "chart" }],
    queryFn: () => adapter.loadAlerts!({ symbolKey }),
    enabled: Boolean(adapter.loadAlerts) && Boolean(symbolKey),
    placeholderData: keepPreviousData,
  });
}
