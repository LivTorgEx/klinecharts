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
  amendable?: boolean;
  amending?: boolean;
  amend_progress?: number;
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
const ORDER_MOVE_EVENTS: (
  | "onPressedMoveStart"
  | "onPressedMoving"
  | "onPressedMoveEnd"
)[] = ["onPressedMoveStart", "onPressedMoving", "onPressedMoveEnd"] as const;

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

  onPressedMoveEnd: ({ overlay }) => {
    const order = overlay.extendData;
    const newPrice = overlay.points[0]?.value;
    if (
      order.amendable &&
      !order.amending &&
      typeof newPrice === "number" &&
      Number.isFinite(newPrice) &&
      newPrice > 0 &&
      newPrice !== order.display_price
    ) {
      window.dispatchEvent(
        new CustomEvent("trading-order-amend", {
          detail: {
            orderId: order.external_order_id,
            symbolKey: order.symbol_key,
            oldPrice: order.display_price,
            newPrice,
          },
        })
      );
    }
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
    const lineStartX = bounding.width * 0.2;
    const lineWidth = Math.max(0, bounding.width - lineStartX);
    const sweepWidth = Math.min(60, lineWidth);
    const sweepStartX =
      lineStartX +
      Math.max(0, lineWidth - sweepWidth) *
        Math.max(0, Math.min(1, order.amend_progress ?? 0));
    const priceIsAboveView = priceY < 0;
    const priceIsBelowView = priceY > bounding.height;
    const markerY =
      order.sticky && (priceIsAboveView || priceIsBelowView)
        ? Math.max(12, Math.min(bounding.height - 12, priceY))
        : priceY;
    const sweepAlpha = [0.06, 0.12, 0.22, 0.38, 0.58, 0.38, 0.22, 0.12, 0.06];
    const sweepFigures =
      order.amending && lineWidth > 0
        ? sweepAlpha.map((alpha, index) => {
            const segmentWidth = sweepWidth / sweepAlpha.length;
            const segmentStartX = sweepStartX + segmentWidth * index;
            return {
              type: "line" as const,
              zLevel: 43,
              ignoreEvent: true,
              styles: { color: `rgba(255, 255, 255, ${alpha})`, size: 3 },
              attrs: {
                coordinates: [
                  { x: segmentStartX, y: markerY },
                  { x: segmentStartX + segmentWidth, y: markerY },
                ],
              },
            };
          })
        : [];
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
            ignoreEvent:
              order.amendable && !order.amending ? false : ORDER_MOVE_EVENTS,
            styles: { color: order.amending ? "#64748b" : color },
            attrs: {
              coordinates: [
                { x: lineStartX, y: markerY },
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
      ...sweepFigures,
      isActive && {
        type: "text",
        zLevel: 42,
        ignoreEvent: !order.amendable,
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
      !isActive &&
        order.showInfo && {
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
          ignoreEvent: ORDER_MOVE_EVENTS,
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
