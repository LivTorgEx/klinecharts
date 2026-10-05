import { registerOverlay } from "klinecharts";
import { formatBigNumber } from "../utils/number";
import type { MarketDecisionOrderBookLevel } from "../types/client/marketDecision";

type OrderBookLineData = MarketDecisionOrderBookLevel & {
  side: "ask" | "bid";
};

registerOverlay<OrderBookLineData>({
  name: "orderBookLine",
  totalStep: 2,
  lock: true,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    const level = overlay.extendData;
    const amount = formatBigNumber(level.price * level.quantity);
    const totalAmount = formatBigNumber(level.total_amount);
    const filled = level.filled && formatBigNumber(level.price * level.filled);
    const color = level.side === "ask" ? "#ef5350" : "#26a69a";

    return [
      {
        type: "line",
        attrs: {
          color,
          coordinates: [
            coordinates[0],
            { x: bounding.width, y: coordinates[0].y },
          ],
        },
      },
      {
        type: "text",
        ignoreEvent: true,
        attrs: {
          x: bounding.width,
          y: coordinates[0].y,
          text: `${amount} [${totalAmount}] ${filled ? `(${filled})` : ""}`,
          color,
          align: "end",
          baseline: "bottom",
        },
      },
    ];
  },
});
