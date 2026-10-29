import { registerOverlay } from "klinecharts";
import {
  PositionDirection,
  type PositionDirection as PositionDirectionType,
} from "../types/client/direction";
import { formatBigNumber } from "../utils/number";
import { isTruthy } from "../utils/filter";

export type TradePositionOverlayData = {
  position_side: PositionDirectionType;
  quantity: number;
  entry_price: number;
  unrealized_pnl: number | null;
  showInfo?: boolean;
};

registerOverlay<TradePositionOverlayData>({
  name: "tradePosition",
  totalStep: 2,
  lock: true,
  zLevel: 40,
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

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    if (!coordinates.length) return [];

    const position = overlay.extendData;
    const isLong =
      position.position_side === PositionDirection.LONG ||
      (position.position_side === PositionDirection.BOTH &&
        position.quantity >= 0);
    const side = isLong ? PositionDirection.LONG : PositionDirection.SHORT;
    const color = isLong ? "#22c55e" : "#ef4444";
    const pnl = position.unrealized_pnl;
    const x = coordinates[0].x;
    const priceY = coordinates[0].y;
    const markerY = Math.max(12, Math.min(bounding.height - 12, priceY));
    const markerPoints = isLong
      ? [
          { x, y: markerY - 9 },
          { x: x - 8, y: markerY + 5 },
          { x: x + 8, y: markerY + 5 },
        ]
      : [
          { x, y: markerY + 9 },
          { x: x - 8, y: markerY - 5 },
          { x: x + 8, y: markerY - 5 },
        ];
    const details = [
      `${side.toUpperCase()} ${formatBigNumber(position.quantity, "")}`,
      `Entry ${formatBigNumber(position.entry_price, "")}`,
      pnl === null ? "" : `PnL ${formatBigNumber(pnl, "")}`,
    ];

    return [
      {
        type: "line",
        zLevel: 39,
        styles: { color, style: "dashed", dashedValue: [4, 3] },
        attrs: {
          coordinates: [
            { x: bounding.width * 0.2, y: priceY },
            { x: bounding.width, y: priceY },
          ],
        },
      },
      {
        type: "polygon",
        zLevel: 40,
        styles: { color },
        attrs: { coordinates: markerPoints },
      },
      position.showInfo && {
        type: "text",
        zLevel: 41,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x,
          y: isLong ? markerY + 30 : markerY - 30,
          text: details.filter(Boolean).join(" | "),
          baseline: "center",
          align: "center",
        },
      },
    ].filter(isTruthy);
  },
});
