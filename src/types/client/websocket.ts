export type WSMessage = {
  type: string;
  payload?: unknown;
};

export type ClientWebsocketMessage = WSMessage;

export type ClientWebSocketConnection = {
  send: (msg: ClientWebsocketMessage) => void;
};
