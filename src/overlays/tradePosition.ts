import { registerOverlay } from "klinecharts";
import type { PositionDirection } from "../types/client/direction";
import { formatBigNumber } from "../utils/number";

export type TradePositionOverlayData = {
  position_side: PositionDirection;
  quantity: number;
  entry_price: number;
  unrealized_pnl: number | null;
};

registerOverlay<TradePositionOverlayData>({
  name: "tradePosition",
  totalStep: 2,
  lock: true,
  zLevel: 50,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    if (!coordinates.length) return [];

    const position = overlay.extendData;
    const isShort = position.position_side === "short";
    const pnl = position.unrealized_pnl;
    const color =
      pnl == null
        ? isShort
          ? "#7f1d1d"
          : "#14532d"
        : pnl >= 0
          ? "#14532d"
          : "#7f1d1d";
    const parts = [
      position.position_side.toUpperCase(),
      formatBigNumber(position.quantity, ""),
    ];
    if (pnl !== null) parts.push(formatBigNumber(pnl, ""));

    return [
      {
        type: "line",
        zLevel: 50,
        styles: { color, style: "dashed", dashedValue: [3, 3] },
        attrs: {
          coordinates: [
            { x: 0, y: coordinates[0].y },
            { x: bounding.width, y: coordinates[0].y },
          ],
        },
      },
      {
        type: "text",
        zLevel: 50,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: bounding.width * 0.2,
          y: coordinates[0].y,
          text: parts.filter(Boolean).join(" | "),
          baseline: "center",
        },
      },
    ];
  },
});
