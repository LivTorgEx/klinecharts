import React from "react";
const noopWs = {
    send: () => { },
    isConnected: false,
    subscribe: () => { },
    sendSubscribe: () => { },
    unsubscribe: () => { },
    sendUnSubscribe: () => { },
};
export const ClientWebSocketContext = React.createContext(noopWs);
export default ClientWebSocketContext;
