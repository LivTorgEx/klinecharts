type TradeIndicatorParams = {
    symbol_id?: number;
    timeframe?: number;
    time?: number;
};
type TradeIndicatorData = {
    indicators: Record<string, Record<string, string | number>>;
};
export declare function useTradeIndicator(_params?: TradeIndicatorParams): {
    data: TradeIndicatorData | undefined;
    isLoading: boolean;
};
export {};
