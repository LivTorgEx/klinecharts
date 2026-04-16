import { ChartInfoDrawType, ChartInfoSignal } from "../../../types/client/chart";

type BacktestDebugTimeInfo = {
  signals: ChartInfoSignal[];
  draws: ChartInfoDrawType[];
  messages: string[];
};

export function useBacktestRunDebug(_id: number): {
  data: Record<number, BacktestDebugTimeInfo> | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isSuccess: boolean;
} {
  return {
    data: undefined,
    isLoading: false,
    refetch: () => Promise.resolve(),
    isSuccess: false,
  };
}
