type WorkerBot = { id: number };

export function useAccountStrategyNFTWorkerBots(
  _workerId?: number,
  _symbolId?: number
) {
  return {
    data: undefined as WorkerBot[] | undefined,
    isLoading: false,
  };
}
