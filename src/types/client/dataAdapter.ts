import { WebsocketProjectionEvent, WebsocketTradeEvent } from "./websocket";
import { SymbolType } from "./symbol";

export type KLineChartLoadSymbolsParams = {
  can_trade?: boolean;
  exchange_code?: string;
};

export type KLineChartLoadBarsParams = {
  tradeGroupId: number;
  timeStart?: number;
  timeEnd?: number;
  timeframe: number;
  limit?: number;
};

export type KLineChartBar = {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  qty_buy: string;
  qty_sell: string;
};

export type KLineChartSubscribeTrade = (
  symbol: string,
  handler: (event: WebsocketTradeEvent) => void
) => () => void;

export type KLineChartSubscribeProjection = (
  symbol: string,
  handler: (event: WebsocketProjectionEvent) => void
) => () => void;

export type KLineChartDataAdapter = {
  loadSymbols: (params: KLineChartLoadSymbolsParams) => Promise<SymbolType[]>;
  loadBars: (params: KLineChartLoadBarsParams) => Promise<KLineChartBar[]>;
  subscribeTrade?: KLineChartSubscribeTrade;
  subscribeProjection?: KLineChartSubscribeProjection;
};
