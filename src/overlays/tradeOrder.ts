import { registerOverlay } from "klinecharts";
import type { PositionOrderType } from "../types/client/order";
import type { TradeOrder } from "../types/client/trade";
import { formatBigNumber } from "../utils/number";
import { isTruthy } from "../utils/filter";

type TradeOrderOverlayData = TradeOrder & {
  display_price: number;
  close_pnl: number | null;
  sticky: boolean;
  isActive?: boolean;
  showInfo?: boolean;
  canCancel?: boolean;
  trigger_order_id?: string | null;
  trigger_algo_order_id?: string | null;
};

const ORDER_TYPE_LABELS: Record<PositionOrderType, string> = {
  market: "Market",
  limit: "Limit",
  stop_market: "Stop Market",
  stop_limit: "Stop Limit",
  take_profit: "Take Profit",
  take_profit_market: "Take Profit Market",
  trailing_stop_market: "Trailing Stop Market",
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

  onClick: ({ overlay, figure }) => {
    if (getFigureRole(figure) === "delete-button") {
      window.dispatchEvent(
        new CustomEvent("trading-order-delete", {
          detail: {
            orderId: overlay.extendData.external_order_id,
            triggerOrderId: overlay.extendData.trigger_order_id,
            triggerAlgoOrderId: overlay.extendData.trigger_algo_order_id,
            orderType: overlay.extendData.order_type,
          },
        })
      );
      return true;
    }
    return false;
  },

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    if (!coordinates.length) return [];

    const order = overlay.extendData;
    const orderType = ORDER_TYPE_LABELS[order.order_type];
    const color = order.side === "sell" ? "#7f1d1d" : "#14532d";
    const isActive = order.isActive !== false;
    const x = coordinates[0].x;
    const priceY = coordinates[0].y;
    const priceIsAboveView = priceY < 0;
    const priceIsBelowView = priceY > bounding.height;
    const markerY =
      order.sticky && (priceIsAboveView || priceIsBelowView)
        ? Math.max(12, Math.min(bounding.height - 12, priceY))
        : priceY;
    const filledQuantity = formatBigNumber(order.filled_quantity, "");
    const quantity = formatBigNumber(order.quantity, "");
    const status = order.status.replaceAll("_", " ");
    const pnl =
      order.close_pnl == null
        ? ""
        : `Est. PnL ${order.close_pnl > 0 ? "+" : ""}${order.close_pnl === 0 ? "0" : formatBigNumber(order.close_pnl, "")}`;
    const infoX = isActive ? bounding.width / 2 : x;
    const markerPoints =
      order.side === "buy"
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

    return [
      isActive
        ? {
            type: "line",
            zLevel: 41,
            styles: { color },
            attrs: {
              coordinates: [
                { x: bounding.width * 0.2, y: markerY },
                { x: bounding.width, y: markerY },
              ],
            },
          }
        : {
            type: "polygon",
            zLevel: 41,
            styles: { color },
            attrs: { coordinates: markerPoints },
          },
      isActive && {
        type: "text",
        zLevel: 42,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: bounding.width * 0.2,
          y: markerY,
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
      !isActive && order.showInfo && {
        type: "text",
        zLevel: 42,
        ignoreEvent: true,
        styles: { backgroundColor: color },
        attrs: {
          x: infoX,
          y: order.side === "buy" ? markerY + 30 : markerY - 30,
          text: [
            `${order.side.toUpperCase()} ${orderType} ${status}`,
            `${filledQuantity}/${quantity} filled`,
            `@ ${formatBigNumber(order.display_price, "")}`,
            pnl,
          ]
            .filter(Boolean)
            .join(" | "),
          baseline: "center",
          align: "center",
        },
      },
      isActive &&
        order.canCancel && {
          type: "text",
          zLevel: 52,
          styles: {
            color: "#ffffff",
            size: 14,
            weight: "bold",
            backgroundColor: color,
          },
          attrs: {
            x: bounding.width * 0.2 - 12,
            y: markerY,
            width: 18,
            height: 22,
            text: "✖",
            align: "center",
            baseline: "middle",
            role: "delete-button",
          },
        },
    ].filter(isTruthy);
  },
});
