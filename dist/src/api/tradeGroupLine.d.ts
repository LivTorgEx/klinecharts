export type TradeGroupLinesParams = {
    timeStart: number;
    timeEnd: number;
    timeframe: number;
    limit: number;
};
export declare function getTradeGroupLines(params: {
    tradeGroupId: number;
} & TradeGroupLinesParams): Promise<any[]>;
