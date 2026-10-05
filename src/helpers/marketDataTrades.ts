import type { WebsocketTradeEvent } from "../types/client/websocket";

type PublicTradeMessage = {
  event: "Trade";
  symbol_key: string;
  trade_id: string;
  price: number;
  quantity: number;
  trade_time: number;
  was_buyer_maker: boolean;
};

export function subscribeMarketDataTrades(
  marketDataApiUrl: string,
  symbolKey: string,
  handler: (trade: WebsocketTradeEvent) => void
): () => void {
  let websocketUrl: URL;
  try {
    websocketUrl = new URL(marketDataApiUrl);
  } catch {
    return () => {};
  }

  if (websocketUrl.protocol === "https:") {
    websocketUrl.protocol = "wss:";
  } else if (websocketUrl.protocol === "http:") {
    websocketUrl.protocol = "ws:";
  } else {
    return () => {};
  }
  websocketUrl.pathname = "/ws";
  websocketUrl.search = "";
  websocketUrl.hash = "";

  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectAttempt = 0;
  let stopped = false;

  const connect = () => {
    if (stopped) return;

    const connection = new WebSocket(websocketUrl.toString());
    socket = connection;
    connection.onopen = () => {
      if (stopped) {
        connection.close();
        return;
      }
      reconnectAttempt = 0;
      connection.send(
        JSON.stringify({
          event: "Subscribe",
          param: { event: "Trade", symbol_key: symbolKey },
        })
      );
    };
    connection.onmessage = (message: MessageEvent<string>) => {
      if (typeof message.data !== "string") return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(message.data);
      } catch {
        return;
      }
      if (!isPublicTradeMessage(parsed) || parsed.symbol_key !== symbolKey) {
        return;
      }

      handler({
        symbol: parsed.symbol_key,
        price: parsed.price,
        quantity: parsed.quantity,
        was_buyer_maker: parsed.was_buyer_maker,
        trade_time: parsed.trade_time,
      });
    };
    connection.onclose = () => {
      if (stopped) return;
      const delay = Math.min(2 ** reconnectAttempt * 1_000, 60_000);
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(connect, delay);
    };
    connection.onerror = () => connection.close();
  };

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "UnSubscribe",
          param: { event: "Trade", symbol_key: symbolKey },
        })
      );
    }
    socket?.close();
    socket = null;
  };
}

function isPublicTradeMessage(value: unknown): value is PublicTradeMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<PublicTradeMessage>;
  return (
    message.event === "Trade" &&
    typeof message.symbol_key === "string" &&
    typeof message.trade_id === "string" &&
    typeof message.price === "number" &&
    Number.isFinite(message.price) &&
    typeof message.quantity === "number" &&
    Number.isFinite(message.quantity) &&
    typeof message.trade_time === "number" &&
    Number.isFinite(message.trade_time) &&
    typeof message.was_buyer_maker === "boolean"
  );
}
