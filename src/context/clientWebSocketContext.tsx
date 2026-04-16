import React from "react";
import type { ClientWebSocketConnection } from "../types/client/websocket";

const noopWs: ClientWebSocketConnection = {
  send: () => {},
  isConnected: false,
  subscribe: () => {},
  sendSubscribe: () => {},
  unsubscribe: () => {},
  sendUnSubscribe: () => {},
};

export const ClientWebSocketContext =
  React.createContext<ClientWebSocketConnection>(noopWs);

export default ClientWebSocketContext;
