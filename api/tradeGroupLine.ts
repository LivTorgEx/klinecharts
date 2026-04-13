export type TradeGroupLinesParams = {
  timeStart: number;
  timeEnd: number;
  timeframe: number;
  limit: number;
};

export async function getTradeGroupLines(params: { tradeGroupId: number } & TradeGroupLinesParams): Promise<any[]> {
  // Minimal stub: return empty list to avoid runtime errors in build
  return [];
}
