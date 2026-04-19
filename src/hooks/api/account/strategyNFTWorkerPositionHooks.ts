import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../../../context/dataAdapterContext";
import {
  KLineChartWorkerPosition,
  KLineChartLoadWorkerPositionsParams,
  KLineChartBotPositionStatus,
} from "../../../types/client/dataAdapter";

type WorkerPositionsResult = { data: KLineChartWorkerPosition[] };

export function useAccountStrategyNFTPositions(
  workerId?: number,
  filter?: { status?: KLineChartBotPositionStatus[] },
  pagination?: { page: number; page_size: number }
) {
  const adapter = useKLineChartDataAdapter();

  const params: KLineChartLoadWorkerPositionsParams | undefined =
    workerId !== undefined
      ? {
          workerId,
          status: filter?.status,
          page: pagination?.page,
          page_size: pagination?.page_size,
        }
      : undefined;

  return useQuery<WorkerPositionsResult>({
    queryKey: [
      "Account/Strategy/NFT/Worker/Positions",
      workerId,
      filter,
      pagination,
    ],
    queryFn: () => adapter.loadWorkerPositions!(params!),
    placeholderData: keepPreviousData,
    enabled: Boolean(params) && Boolean(adapter.loadWorkerPositions),
  });
}
