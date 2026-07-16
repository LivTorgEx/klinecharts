import { useEffect, useState } from "react";

import { useChartSettings } from "../context/chartSettings";
import { useSubscribeProjection } from "../context/dataAdapterContext";
import { useSymbolKey } from "../context/symbolKey";
import { useTradeIndicator } from "../hooks/api/tradeIndicator";
import type { WebsocketProjectionEvent } from "../types/client/websocket";
import { KLinePropjectionIndicators } from "./KLinePropjectionIndicators";

type Props = {
  timeframe: number;
  selectedIndicatorTime?: number;
};

export function KLineProjection({ timeframe, selectedIndicatorTime }: Props) {
  const { projection } = useChartSettings();
  const subscribeProjection = useSubscribeProjection();
  const symbolKey = useSymbolKey();
  const [projectionEvent, setProjectionEvent] = useState<
    WebsocketProjectionEvent | undefined
  >(undefined);
  const { data: indicatorSnapshot } = useTradeIndicator({
    timeframe,
    time: selectedIndicatorTime,
  });

  useEffect(() => {
    if (!symbolKey || !subscribeProjection) {
      return;
    }

    const unsubscribe = subscribeProjection(symbolKey, setProjectionEvent);
    return () => {
      unsubscribe();
    };
  }, [subscribeProjection, symbolKey]);

  if (!projection.items.length) {
    return null;
  }

  return (
    <KLinePropjectionIndicators
      items={projection.items}
      projection={projectionEvent}
      indicatorSnapshot={indicatorSnapshot}
    />
  );
}
