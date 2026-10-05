import { useEffect, useRef } from "react";
import type { Chart, OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useChartSettings } from "../context/chartSettings";
import { useMarketDecision } from "../context/marketDecision";
import type { MarketDecisionOrderBookLevel } from "../types/client/marketDecision";

type Side = "ask" | "bid";

type OrderBookOverlay = MarketDecisionOrderBookLevel & {
  side: Side;
};

function removeOverlays(chart: Chart, ids: Set<string>) {
  ids.forEach((id) => chart.removeOverlay({ id }));
  ids.clear();
}

export function KLineChartOrderBook({
  symbolKey,
  enabled,
}: {
  symbolKey?: string;
  enabled: boolean;
}) {
  const chart = useChart();
  const { orderBook } = useChartSettings();
  const decision = useMarketDecision();
  const overlayIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      !chart ||
      !symbolKey ||
      !enabled ||
      !orderBook.show ||
      !decision ||
      decision.symbol_key !== symbolKey
    ) {
      if (chart) removeOverlays(chart, overlayIds.current);
      return;
    }

    const currentIds = new Set<string>();
    const updateSide = (side: Side, levels: MarketDecisionOrderBookLevel[]) => {
      levels.forEach((level, index) => {
        const id = `order_book_${side}_${index}`;
        const extendData: OrderBookOverlay = { ...level, side };
        const points: OverlayCreate["points"] = [
          { timestamp: decision.time, value: level.price },
          { timestamp: decision.time + 1, value: level.price },
        ];

        if (chart.getOverlays({ id }).length) {
          chart.overrideOverlay({ id, points, extendData });
        } else {
          chart.createOverlay({
            name: "orderBookLine",
            id,
            points,
            extendData,
          });
        }
        currentIds.add(id);
      });
    };

    updateSide("ask", decision.order_book?.asks ?? []);
    updateSide("bid", decision.order_book?.bids ?? []);

    overlayIds.current.forEach((id) => {
      if (!currentIds.has(id)) chart.removeOverlay({ id });
    });
    overlayIds.current = currentIds;
  }, [chart, decision, enabled, orderBook.show, symbolKey]);

  useEffect(
    () => () => {
      if (chart) removeOverlays(chart, overlayIds.current);
    },
    [chart]
  );

  return null;
}
