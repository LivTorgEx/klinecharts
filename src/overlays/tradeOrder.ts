import { registerOverlay } from "klinecharts";
import type { PositionOrderType } from "../types/client/order";
import type { TradeOrder } from "../types/client/trade";
import { formatBigNumber } from "../utils/number";

type TradeOrderOverlayData = TradeOrder & {
  display_price: number;
  close_pnl: number | null;
  sticky: boolean;
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
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

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
    const order = overlay.extendData;
    const orderType = ORDER_TYPE_LABELS[order.order_type];
    const quantity = formatBigNumber(order.quantity, "");
    const color = order.side === "sell" ? "#991b1b" : "#15803d";
    const pnl =
      order.close_pnl == null
        ? ""
        : `Est. PnL ${order.close_pnl > 0 ? "+" : ""}${order.close_pnl === 0 ? "0" : formatBigNumber(order.close_pnl, "")}`;
    const isSticky = order.sticky;
    const priceIsAboveView = coordinates[0].y < 0;
    const priceIsBelowView = coordinates[0].y > bounding.height;
    const priceIsOutsideView = priceIsAboveView || priceIsBelowView;
    const edgeY =
      isSticky && priceIsOutsideView
        ? Math.max(12, Math.min(bounding.height - 12, coordinates[0].y))
        : coordinates[0].y;
    const protectionLabel = priceIsAboveView
      ? `${orderType} ↑ ${formatBigNumber(order.display_price, "")} (above view)`
      : priceIsBelowView
        ? `${orderType} ↓ ${formatBigNumber(order.display_price, "")} (below view)`
        : `${orderType} ${formatBigNumber(order.display_price, "")}`;

    const figures =
      priceIsOutsideView && isSticky
        ? [
            {
              type: "polygon",
              zLevel: 41,
              ignoreEvent: true,
              styles: { color },
              attrs: {
                coordinates: priceIsAboveView
                  ? [
                      { x: bounding.width - 10, y: edgeY },
                      { x: bounding.width - 18, y: edgeY + 10 },
                      { x: bounding.width - 2, y: edgeY + 10 },
                    ]
                  : [
                      { x: bounding.width - 10, y: edgeY },
                      { x: bounding.width - 18, y: edgeY - 10 },
                      { x: bounding.width - 2, y: edgeY - 10 },
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
                y: edgeY,
                text: [quantity, protectionLabel].filter(Boolean).join(" | "),
                baseline: "center",
              },
            },
          ]
        : [
            {
              type: "line",
              zLevel: 40,
              ignoreEvent: true,
              styles: { color },
              attrs: {
                coordinates: [
                  { x: bounding.width * 0.2, y: edgeY },
                  { x: bounding.width, y: edgeY },
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
                y: edgeY,
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
          ];

    return [
      ...figures,
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
