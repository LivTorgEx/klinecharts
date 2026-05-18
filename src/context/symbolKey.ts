import { createContext, useContext } from "react";

/**
 * Provides the full symbolKey (e.g. "BINANCE#BTCUSDT#SPOT") for the current
 * chart.  Components that subscribe to trade or projection events read this
 * context instead of relying on a separately-registered symbol→exchange map.
 */
export const SymbolKeyContext = createContext<string>("");

export function useSymbolKey(): string {
  return useContext(SymbolKeyContext);
}
