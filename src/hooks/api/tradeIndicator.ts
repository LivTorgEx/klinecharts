type TradeIndicatorParams = {
  symbol_id?: number;
  timeframe?: number;
  time?: number;
};

type TradeIndicatorData = {
  indicators: Record<string, Record<string, string | number>>;
};

export function useTradeIndicator(_params?: TradeIndicatorParams) {
  return {
    data: undefined as TradeIndicatorData | undefined,
    isLoading: false,
  };
}
