import { registerOverlay } from "klinecharts";

import type { TradeOrder } from "../types/client/trade";
import { formatBigNumber } from "../utils/number";

type TradeOrderHistoryOverlayData = TradeOrder & {
  start_price: number;
  end_price: number;
};

registerOverlay<TradeOrderHistoryOverlayData>({
  name: "tradeOrderHistory",
  totalStep: 2,
  lock: true,
  zLevel: 18,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,

  createPointFigures: ({ coordinates, overlay }) => {
    if (coordinates.length < 2) return [];

    const order = overlay.extendData;
    const isFilled = order.status === "filled" || order.filled_quantity > 0;
    const color = isFilled
      ? order.side === "buy"
        ? "#22c55e"
        : "#ef4444"
      : "#6b7280";
    const text = `${order.status.replaceAll("_", " ")} | ${formatBigNumber(order.filled_quantity || order.quantity, "")} | ${formatBigNumber(order.end_price, "")}`;

    return [
      {
        type: "line",
        zLevel: 18,
        styles: { color, style: "dashed", dashedValue: [3, 3] },
        attrs: { coordinates: [coordinates[0], coordinates[1]] },
      },
      {
        type: "circle",
        zLevel: 19,
        styles: { color },
        attrs: { x: coordinates[0].x, y: coordinates[0].y, r: 4 },
      },
      {
        type: "circle",
        zLevel: 19,
        styles: { color },
        attrs: { x: coordinates[1].x, y: coordinates[1].y, r: 5 },
      },
      {
        type: "text",
        zLevel: 20,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: coordinates[1].x,
          y: coordinates[1].y,
          text,
          baseline: "bottom",
          align: "center",
        },
      },
    ];
  },
});
