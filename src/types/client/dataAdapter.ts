import { WebsocketProjectionEvent, WebsocketTradeEvent } from "./websocket";
import { SymbolType } from "./symbol";
import { PositionOrder } from "./order";

export type KLineChartLoadSymbolsParams = {
  can_trade?: boolean;
  exchange_code?: string;
};

export type KLineChartBotPositionStatus =
  | "Created"
  | "InProgress"
  | "Finishing"
  | "Completed"
  | "Failed";

export type KLineChartBotPosition = {
  id: number | string;
  side: string;
  qty: number;
  entry_price: number;
  total_profit: number;
  fee: number;
  status: KLineChartBotPositionStatus;
  created_at: string;
  orders: PositionOrder[];
};

export type KLineChartLoadBotPositionsParams = {
  bot_id?: number;
  status?: KLineChartBotPositionStatus[];
  order_status?: string[];
};

export type KLineChartWorkerPosition = {
  symbol_id: number;
  bot_id: number;
};

export type KLineChartLoadWorkerPositionsParams = {
  workerId: number;
  status?: KLineChartBotPositionStatus[];
  page?: number;
  page_size?: number;
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
  loadBotPositions?: (
    params: KLineChartLoadBotPositionsParams
  ) => Promise<{ data: KLineChartBotPosition[] }>;
  loadWorkerPositions?: (
    params: KLineChartLoadWorkerPositionsParams
  ) => Promise<{ data: KLineChartWorkerPosition[] }>;
  subscribeTrade?: KLineChartSubscribeTrade;
  subscribeProjection?: KLineChartSubscribeProjection;
};
