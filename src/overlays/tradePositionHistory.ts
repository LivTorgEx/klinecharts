import { registerOverlay } from "klinecharts";

import type { PositionDirection } from "../types/client/direction";
import { formatBigNumber } from "../utils/number";

type TradePositionHistoryOverlayData = {
  position_side: PositionDirection;
  quantity: number;
  realized_profit: number;
};

registerOverlay<TradePositionHistoryOverlayData>({
  name: "tradePositionHistory",
  totalStep: 2,
  lock: true,
  zLevel: 20,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,

  createPointFigures: ({ coordinates, overlay }) => {
    if (coordinates.length < 2) return [];

    const position = overlay.extendData;
    const color = position.realized_profit >= 0 ? "#22c55e" : "#ef4444";
    const summary = `${position.position_side.toUpperCase()} ${formatBigNumber(position.quantity, "")} | ${formatBigNumber(position.realized_profit, "")}`;

    return [
      {
        type: "line",
        zLevel: 20,
        styles: { color, style: "dashed", dashedValue: [4, 3] },
        attrs: { coordinates: [coordinates[0], coordinates[1]] },
      },
      {
        type: "circle",
        zLevel: 21,
        styles: { color },
        attrs: { x: coordinates[0].x, y: coordinates[0].y, r: 4 },
      },
      {
        type: "circle",
        zLevel: 21,
        styles: { color },
        attrs: { x: coordinates[1].x, y: coordinates[1].y, r: 5 },
      },
      {
        type: "text",
        zLevel: 22,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: coordinates[1].x,
          y: coordinates[1].y,
          text: summary,
          baseline: "bottom",
          align: "center",
        },
      },
    ];
  },
});
