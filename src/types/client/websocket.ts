export type WSMessage = {
  type: string;
  payload?: string | number | boolean | null | Record<string, string | number | boolean | null>;
};

export type ClientWebsocketMessage = WSMessage;

export const WebsocketEventName = {
  Trade: "Trade",
  Projection: "Projection",
} as const;

export type WebsocketEventName = (typeof WebsocketEventName)[keyof typeof WebsocketEventName];

export type WebsocketTradeEvent = {
  symbol: string;
  price: number;
  quantity: number;
  was_buyer_maker: boolean;
  trade_time: number;
};

type WebsocketProjectionOrderBook = {
  buy_amount?: number;
  sell_amount?: number;
  buy_price?: number;
  sell_price?: number;
  long_levels: Array<{ price: number; qty: number; time_start: number }>;
  short_levels: Array<{ price: number; qty: number; time_start: number }>;
};

type WebsocketProjectionWave = {
  exit_time: number;
  enter_time: number;
  enter_price: number;
  exit_price: number;
  direction: string;
  qtym: number;
  percentile: number;
  over_candles: Array<[number, number]>;
};

export type WebsocketProjectionEvent = {
  symbol: string;
  status: string;
  price?: number;
  indicator: {
    ntps: number;
    ntps_fast_time?: number;
    asset_01: number;
    asset_diff_01: number;
    trandm: number;
    price_1h: number;
    price_4h: number;
    price_8h: number;
    price_24h: number;
  };
  order_book?: WebsocketProjectionOrderBook;
  waves: Record<number, WebsocketProjectionWave>;
  movements?: Record<number, import("./suggestion").SuggestionLineConsolidationMove>;
  oi?: {
    usd: number;
    change: number;
    change_qty: number;
    avg: number;
  };
  candle?: {
    qtym_asset: number;
  };
};

export type ClientWebSocketConnection = {
  send: (msg: ClientWebsocketMessage) => void;
  isConnected: boolean;
  subscribe: <T extends WebsocketTradeEvent | WebsocketProjectionEvent>(
    event: WebsocketEventName,
    handler: (data: T) => void
  ) => void;
  sendSubscribe: (data: { event: string; symbol: string }) => void;
  unsubscribe: <T extends WebsocketTradeEvent | WebsocketProjectionEvent>(
    event: WebsocketEventName,
    handler: (data: T) => void
  ) => void;
  sendUnSubscribe: (data: { event: string; symbol: string }) => void;
};
