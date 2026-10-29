import { registerOverlay } from "klinecharts";

import type { PositionDirection } from "../types/client/direction";
import { formatBigNumber } from "../utils/number";
import { isTruthy } from "../utils/filter";

type TradePositionHistoryOverlayData = {
  position_side: PositionDirection;
  quantity: number;
  realized_profit: number;
  showInfo?: boolean;
};

registerOverlay<TradePositionHistoryOverlayData>({
  name: "tradePositionHistory",
  totalStep: 2,
  drawingMode: "continuous",
  lock: true,
  zLevel: 20,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,

  onMouseEnter: ({ overlay }) => {
    overlay.extendData.showInfo = true;
    return true;
  },
  onMouseLeave: ({ overlay }) => {
    overlay.extendData.showInfo = false;
    return true;
  },

  createPointFigures: ({ coordinates, overlay, bounding }) => {
    if (coordinates.length < 2) return [];

    const position = overlay.extendData;
    const color = position.realized_profit >= 0 ? "#22c55e" : "#ef4444";
    const summary = `${position.position_side.toUpperCase()} ${formatBigNumber(position.quantity, "")} | PnL ${formatBigNumber(position.realized_profit, "")}`;
    const labelWidth = summary.length * 7;
    const leftRoom = coordinates[0].x - bounding.left;
    const rightRoom = bounding.width - leftRoom;
    const align =
      leftRoom >= labelWidth / 2 && rightRoom >= labelWidth / 2
        ? "center"
        : leftRoom >= rightRoom
          ? "right"
          : "left";

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
      position.showInfo && {
        type: "text",
        zLevel: 22,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: coordinates[0].x,
          y: coordinates[0].y,
          text: summary,
          baseline: "bottom",
          align,
        },
      },
    ].filter(isTruthy);
  },
});
