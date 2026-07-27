import { WebsocketProjectionEvent, WebsocketTradeEvent } from "./websocket";
import { SymbolType } from "./symbol";
import type {
  KLineChartPosition,
  KLineChartPositionStatus,
} from "./klinechart";
import type { ChartSettingsProjectionIndicatorSource } from "./chart";

export type KLineChartLoadSymbolsParams = {
  can_trade?: boolean;
  exchange_code?: string;
};

export type KLineChartLoadBotPositionsParams = {
  bot_id?: number;
  symbol_key?: string;
  status?: KLineChartPositionStatus[];
  order_status?: string[];
};

export type KLineChartWorkerPosition = {
  symbol_id: number;
  bot_id: number;
};

export type KLineChartLoadWorkerPositionsParams = {
  workerId: number;
  status?: KLineChartPositionStatus[];
  page?: number;
  page_size?: number;
};

export type KLineChartLoadBarsParams = {
  symbolKey: string;
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
  qty_buy: number;
  qty_sell: number;
};

export type KLineChartSubscribeTrade = (
  symbolKey: string,
  handler: (event: WebsocketTradeEvent) => void
) => () => void;

export type KLineChartSubscribeProjection = (
  symbolKey: string,
  handler: (event: WebsocketProjectionEvent) => void
) => () => void;

export type KLineChartAlertLine = {
  id: string;
  price: number;
  label: string;
  color?: string;
};

export type KLineChartProjectionIndicatorCatalogItem = {
  name: string;
  key: string;
  period?: string;
  properties?: string[];
};

export type KLineChartProjectionIndicatorSnapshot = {
  id: number;
  time: number;
  indicators: Record<string, Record<string, string | number>>;
};

export type KLineChartLoadProjectionIndicatorsParams = {
  symbolKey: string;
  timeframe: number;
  time?: number;
  indicatorName?: string;
  limit?: number;
  offset?: number;
};

export type KLineChartDataAdapter = {
  loadSymbols: (params: KLineChartLoadSymbolsParams) => Promise<SymbolType[]>;
  loadBars: (params: KLineChartLoadBarsParams) => Promise<KLineChartBar[]>;
  loadProjectionIndicatorCatalog?: () => Promise<
    KLineChartProjectionIndicatorCatalogItem[]
  >;
  loadProjectionIndicators?: (
    params: KLineChartLoadProjectionIndicatorsParams
  ) => Promise<KLineChartProjectionIndicatorSnapshot | null>;
  loadBotPositions?: (
    params: KLineChartLoadBotPositionsParams
  ) => Promise<{ data: KLineChartPosition[] }>;
  loadWorkerPositions?: (
    params: KLineChartLoadWorkerPositionsParams
  ) => Promise<{ data: KLineChartWorkerPosition[] }>;
  loadAlerts?: (params: {
    symbolKey: string;
  }) => Promise<KLineChartAlertLine[]>;
  updateAlertPrice?: (alertId: string, newPrice: number) => Promise<void>;
  deleteAlert?: (alertId: string) => Promise<void>;
  onAlertError?: (message: string) => void;
  subscribeTrade?: KLineChartSubscribeTrade;
  subscribeProjection?: KLineChartSubscribeProjection;
};
