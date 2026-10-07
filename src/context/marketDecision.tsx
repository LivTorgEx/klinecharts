import { createContext, useContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

import { useSubscribeMarketDecision } from "./dataAdapterContext";
import type { MarketDecision } from "../types/client/marketDecision";

const MarketDecisionContext = createContext<MarketDecision | null>(null);

export function KLineChartMarketDecisionProvider({
  symbolKey,
  marketDataSymbolKey,
  enabled,
  children,
}: PropsWithChildren<{
  symbolKey?: string;
  marketDataSymbolKey?: string;
  enabled: boolean;
}>) {
  const subscribeMarketDecision = useSubscribeMarketDecision();
  const sourceKey = marketDataSymbolKey ?? symbolKey;
  const [snapshot, setSnapshot] = useState<{
    symbolKey: string;
    sourceKey: string;
    decision: MarketDecision;
  } | null>(null);

  useEffect(() => {
    if (!symbolKey || !sourceKey || !enabled || !subscribeMarketDecision) {
      return;
    }

    return subscribeMarketDecision(sourceKey, (decision) => {
      if (decision.symbol_key === sourceKey) {
        setSnapshot({ symbolKey, sourceKey, decision });
      }
    });
  }, [enabled, sourceKey, subscribeMarketDecision, symbolKey]);

  const decision =
    enabled &&
    snapshot &&
    snapshot.symbolKey === symbolKey &&
    snapshot.sourceKey === sourceKey
      ? snapshot.decision
      : null;

  return (
    <MarketDecisionContext.Provider value={decision}>
      {children}
    </MarketDecisionContext.Provider>
  );
}

export function useMarketDecision() {
  return useContext(MarketDecisionContext);
}
