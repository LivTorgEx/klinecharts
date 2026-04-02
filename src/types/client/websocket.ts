export type WSMessage = {
  type: string;
  payload?: any;
};

export type ClientWebsocketMessage = WSMessage;

export type ClientWebSocketConnection = {
  send: (msg: ClientWebsocketMessage) => void;
};
