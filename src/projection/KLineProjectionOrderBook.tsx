import { useCallback, useEffect, useRef } from "react";
import { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { WebsocketProjectionEvent } from "../types/client/websocket";
import { useSubscribeProjection } from "../context/dataAdapterContext";

type Props = {
  tokenName: string;
};

export function KLineProjectionOrderBook({ tokenName }: Props) {
  const chart = useChart();
  const subscribeProjection = useSubscribeProjection();
  const overlayKeys = useRef<Set<string>>(new Set());

  const handleUpdateProjection = useCallback(
    (event: WebsocketProjectionEvent) => {
      if (event.symbol !== tokenName || !chart || !event.order_book) {
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
    [chart, tokenName]
  );

  useEffect(() => {
    if (!chart || !subscribeProjection) {
      return;
    }

    const unsubscribeProjection = subscribeProjection(
      tokenName,
      handleUpdateProjection
    );

    return () => {
      unsubscribeProjection();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      overlayKeys.current.forEach((id) => {
        chart.removeOverlay({ id });
      });
    };
  }, [subscribeProjection, chart, tokenName, handleUpdateProjection]);

  return null;
}
