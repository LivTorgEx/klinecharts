import { registerOverlay } from "klinecharts";
import type { TradeOrder } from "../types/client/trade";
import { formatBigNumber } from "../utils/number";

type TradeOrderOverlayData = TradeOrder & {
  display_price: number;
  close_pnl: number | null;
};

function getFigureRole(figure: { attrs?: unknown } | undefined) {
  if (
    !figure?.attrs ||
    typeof figure.attrs !== "object" ||
    !("role" in figure.attrs)
  ) {
    return undefined;
  }
  return typeof figure.attrs.role === "string" ? figure.attrs.role : undefined;
}

registerOverlay<TradeOrderOverlayData>({
  name: "tradeOrder",
  totalStep: 2,
  lock: false,
  zLevel: 40,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  onClick: ({ overlay, figure }) => {
    if (getFigureRole(figure) === "delete-button") {
      window.dispatchEvent(
        new CustomEvent("trading-order-delete", {
          detail: { orderId: overlay.extendData.external_order_id },
        })
      );
      return true;
    }
    return false;
  },

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    const order = overlay.extendData;
    const orderType = order.order_type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const quantity = formatBigNumber(order.quantity, "");
    const color = order.side === "sell" ? "#991b1b" : "#15803d";
    const pnl =
      order.close_pnl == null
        ? ""
        : `Est. PnL ${order.close_pnl > 0 ? "+" : ""}${order.close_pnl === 0 ? "0" : formatBigNumber(order.close_pnl, "")}`;

    return [
      {
        type: "line",
        zLevel: 40,
        ignoreEvent: true,
        styles: { color },
        attrs: {
          coordinates: [
            { x: bounding.width * 0.2, y: coordinates[0].y },
            { x: bounding.width, y: coordinates[0].y },
          ],
        },
      },
      {
        type: "text",
        zLevel: 40,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: bounding.width * 0.2,
          y: coordinates[0].y,
          text: [
            quantity,
            orderType,
            formatBigNumber(order.display_price, ""),
            pnl,
          ]
            .filter(Boolean)
            .join(" | "),
          baseline: "center",
        },
      },
      {
        type: "text",
        zLevel: 52,
        ignoreEvent: [
          "onPressedMoveStart",
          "onPressedMoving",
          "onPressedMoveEnd",
        ],
        styles: {
          color: "#ffffff",
          size: 14,
          weight: "bold",
          backgroundColor: color,
        },
        attrs: {
          x: bounding.width * 0.2 - 12,
          y: coordinates[0].y,
          width: 18,
          height: 22,
          text: "✖",
          align: "center",
          baseline: "middle",
          role: "delete-button",
        },
      },
    ];
  },
});
