import { useCallback, useEffect, useRef } from "react";
import { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { WebsocketProjectionEvent } from "../types/client/websocket";
import { useSubscribeProjection } from "../context/dataAdapterContext";
import { useSymbolKey } from "../context/symbolKey";

type Props = {
  /** @deprecated symbolKey is now read from SymbolKeyContext */
  tokenName?: string;
};

export function KLineProjectionOrderBook(_props: Props) {
  const chart = useChart();
  const subscribeProjection = useSubscribeProjection();
  const overlayKeys = useRef<Set<string>>(new Set());
  const symbolKey = useSymbolKey();
  const symbol = symbolKey.split("#")[1] ?? "";

  const handleUpdateProjection = useCallback(
    (event: WebsocketProjectionEvent) => {
      if (event.symbol !== symbol || !chart || !event.order_book) {
        return;
      }

      const removeSet = new Set(overlayKeys.current);
      [
        ...event.order_book.short_levels,
        ...event.order_book.long_levels,
      ].forEach((level) => {
        const points: OverlayCreate["points"] = [
          {
            timestamp: level.time_start,
            value: level.price,
          },
        ];
        const id = `orderBookLevel_${level.price}`;
        if (chart.getOverlays({ id }).length) {
          chart.overrideOverlay({ id, points, extendData: level });
        } else {
          chart.createOverlay({
            name: "orderBookLine",
            id,
            lock: true,
            points,
            extendData: level,
          });
        }
        overlayKeys.current.add(id);
        removeSet.delete(id);
      });

      removeSet.forEach((id) => {
        chart.removeOverlay({ id });
      });
    },
    [chart, symbolKey]
  );

  useEffect(() => {
    if (!chart || !subscribeProjection) {
      return;
    }

    const unsubscribeProjection = subscribeProjection(
      symbolKey,
      handleUpdateProjection
    );

    return () => {
      unsubscribeProjection();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      overlayKeys.current.forEach((id) => {
        chart.removeOverlay({ id });
      });
    };
  }, [subscribeProjection, chart, symbolKey, handleUpdateProjection]);

  return null;
}
