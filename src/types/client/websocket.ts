export type WSMessage = {
  type: string;
  payload?:
    | string
    | number
    | boolean
    | null
    | Record<string, string | number | boolean | null>;
};

export type ClientWebsocketMessage = WSMessage;

export const WebsocketEventName = {
  Trade: "Trade",
} as const;

export type WebsocketEventName =
  (typeof WebsocketEventName)[keyof typeof WebsocketEventName];

export type WebsocketTradeEvent = {
  symbol: string;
  price: number;
  quantity: number;
  was_buyer_maker: boolean;
  trade_time: number;
};

export type ClientWebSocketConnection = {
  send: (msg: ClientWebsocketMessage) => void;
  isConnected: boolean;
  subscribe: <T extends WebsocketTradeEvent>(
    event: WebsocketEventName,
    handler: (data: T) => void
  ) => void;
  sendSubscribe: (data: { event: string; symbol: string }) => void;
  unsubscribe: <T extends WebsocketTradeEvent>(
    event: WebsocketEventName,
    handler: (data: T) => void
  ) => void;
  sendUnSubscribe: (data: { event: string; symbol: string }) => void;
};
