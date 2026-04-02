import React from 'react';
import type { ClientWebSocketConnection } from '../types/client/websocket';

export const ClientWebSocketContext = React.createContext<ClientWebSocketConnection | null>(null);
export default ClientWebSocketContext;
