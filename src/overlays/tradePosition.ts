import { registerOverlay, type Chart, type Overlay } from "klinecharts";
import {
  OrderSide,
  PositionDirection,
  type PositionDirection as PositionDirectionType,
} from "../types/client/direction";
import type { TradeOrder } from "../types/client/trade";
import { isTruthy } from "../utils/filter";
import { formatBigNumber } from "../utils/number";

type ProtectionPreviewOrder = TradeOrder & {
  display_price: number;
  close_pnl: number;
  sticky: boolean;
  isActive: boolean;
  showInfo: boolean;
  canCancel: boolean;
  amendable: boolean;
  amending: boolean;
  amend_progress: number;
  preview: boolean;
  awaiting_response?: boolean;
  position_id: string;
};

export type TradePositionOverlayData = {
  position_side: PositionDirectionType;
  quantity: number;
  entry_price: number;
  reference_price: number;
  entry_timestamp: number;
  unrealized_pnl: number | null;
  position_id: string;
  symbol_key: string;
  can_set_stop_loss: boolean;
  can_set_take_profit: boolean;
  can_show_protection_action?: boolean;
  pending_stop_loss_price?: number;
  pending_take_profit_price?: number;
  pending_progress?: number;
  show_protection_actions?: boolean;
  dragging_protection?: boolean;
  has_dragged_protection?: boolean;
};

export function getProtectionPreviewOverlayId(positionId: string) {
  return `trade_position_protection_preview_${positionId}`;
}

function isProtectionDragHandle(figure: { attrs?: unknown } | undefined) {
  if (
    !figure?.attrs ||
    typeof figure.attrs !== "object" ||
    !("role" in figure.attrs)
  ) {
    return undefined;
  }
  const role = figure.attrs.role;
  return role === "protection-tp-sl";
}

function getProtectionLeg(position: TradePositionOverlayData, price: number) {
  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    price === position.reference_price
  ) {
    return undefined;
  }
  const isLong = position.position_side === "long";
  const isTakeProfit = isLong
    ? price > position.reference_price
    : price < position.reference_price;
  return isTakeProfit ? "take_profit" : "stop_loss";
}

function removeProtectionPreview(chart: Chart, positionId: string) {
  chart.removeOverlay({ id: getProtectionPreviewOverlayId(positionId) });
}

function updateProtectionPreview(
  chart: Chart,
  position: TradePositionOverlayData,
  price: number
) {
  const leg = getProtectionLeg(position, price);
  if (
    !leg ||
    (leg === "stop_loss"
      ? !position.can_set_stop_loss
      : !position.can_set_take_profit)
  ) {
    removeProtectionPreview(chart, position.position_id);
    return;
  }

  const isLong = position.position_side === PositionDirection.LONG;
  const quantity = Math.abs(position.quantity);
  const id = getProtectionPreviewOverlayId(position.position_id);
  const extendData: ProtectionPreviewOrder = {
    external_order_id: id,
    chart_overlay_key: id,
    client_order_id: null,
    symbol_key: position.symbol_key,
    side: isLong ? OrderSide.SELL : OrderSide.BUY,
    position_side: position.position_side,
    order_type: leg === "stop_loss" ? "stop_market" : "take_profit_market",
    status: "pending_trigger",
    quantity,
    filled_quantity: 0,
    price: null,
    average_price: null,
    stop_price: price,
    commission: null,
    realized_profit: null,
    created_at: position.entry_timestamp,
    updated_at: position.entry_timestamp,
    display_price: price,
    close_pnl:
      (isLong ? price - position.entry_price : position.entry_price - price) *
      quantity,
    sticky: false,
    isActive: true,
    showInfo: false,
    canCancel: false,
    amendable: false,
    amending: false,
    amend_progress: 0,
    preview: true,
    position_id: position.position_id,
  };
  const points = [{ timestamp: position.entry_timestamp, value: price }];

  if (chart.getOverlays({ id }).length) {
    chart.overrideOverlay({ id, points, extendData });
  } else {
    chart.createOverlay({
      name: "tradeOrder",
      id,
      points,
      lock: true,
      extendData,
    });
  }
}

registerOverlay<TradePositionOverlayData>({
  name: "tradePosition",
  totalStep: 2,
  lock: false,
  zLevel: 50,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  onMouseEnter: ({ overlay }) => {
    overlay.extendData.show_protection_actions = true;
    return true;
  },
  onMouseLeave: ({ overlay }) => {
    if (!overlay.extendData.dragging_protection) {
      overlay.extendData.show_protection_actions = false;
    }
    return true;
  },
  onPressedMoveStart: ({ overlay, figure }) => {
    if (
      isProtectionDragHandle(figure) &&
      (overlay.extendData.can_set_stop_loss ||
        overlay.extendData.can_set_take_profit)
    ) {
      overlay.extendData.dragging_protection = true;
      overlay.extendData.has_dragged_protection = false;
    }
    return true;
  },
  onPressedMoving: ({ overlay, chart }) => {
    if (
      overlay.extendData.dragging_protection &&
      overlay.points[0]?.value !== overlay.extendData.entry_price
    ) {
      overlay.extendData.has_dragged_protection = true;
    }
    const price = overlay.points[0]?.value;
    if (
      overlay.extendData.dragging_protection &&
      overlay.extendData.has_dragged_protection &&
      typeof price === "number"
    ) {
      updateProtectionPreview(chart, overlay.extendData, price);
    }
    return true;
  },
  onPressedMoveEnd: ({ overlay, chart }) => {
    const position = overlay.extendData;
    const newPrice = overlay.points[0]?.value;
    const leg =
      position.dragging_protection &&
      position.has_dragged_protection &&
      typeof newPrice === "number"
        ? getProtectionLeg(position, newPrice)
        : undefined;
    let pendingPrice: number | undefined;
    if (
      leg &&
      (leg === "stop_loss"
        ? position.can_set_stop_loss
        : position.can_set_take_profit) &&
      typeof newPrice === "number" &&
      Number.isFinite(newPrice) &&
      newPrice > 0
    ) {
      window.dispatchEvent(
        new CustomEvent("trading-position-protection-place", {
          detail: {
            positionId: position.position_id,
            symbolKey: position.symbol_key,
            leg,
            newPrice,
            onPending: (price: number) => {
              pendingPrice = price;
            },
          },
        })
      );
    }

    position.dragging_protection = false;
    position.has_dragged_protection = false;
    position.show_protection_actions = true;
    const previewId = getProtectionPreviewOverlayId(position.position_id);
    const previewOverlay = chart.getOverlays({ id: previewId })[0] as
      | Overlay<ProtectionPreviewOrder>
      | undefined;
    if (pendingPrice != null && leg && previewOverlay) {
      const isLong = position.position_side === PositionDirection.LONG;
      chart.overrideOverlay({
        id: previewId,
        points: [{ timestamp: position.entry_timestamp, value: pendingPrice }],
        extendData: {
          ...previewOverlay.extendData,
          display_price: pendingPrice,
          stop_price: pendingPrice,
          close_pnl:
            (isLong
              ? pendingPrice - position.entry_price
              : position.entry_price - pendingPrice) *
            Math.abs(position.quantity),
          amendable: false,
          amending: true,
          amend_progress: 0,
          awaiting_response: true,
        },
      });
    } else {
      removeProtectionPreview(chart, position.position_id);
    }
    chart.overrideOverlay({
      id: overlay.id,
      points: [
        { timestamp: position.entry_timestamp, value: position.entry_price },
      ],
      extendData: { ...position },
    });
    return true;
  },

  createPointFigures: ({ coordinates, bounding, overlay, yAxis }) => {
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
    const entryY =
      yAxis?.convertToPixel(position.entry_price) ?? coordinates[0].y;
    const pendingProgress = Math.max(
      0,
      Math.min(1, position.pending_progress ?? 0)
    );
    const pendingLines = [
      {
        price: position.pending_stop_loss_price,
        color: "#ef4444",
      },
      {
        price: position.pending_take_profit_price,
        color: "#22c55e",
      },
    ].filter(
      (line): line is { price: number; color: string } =>
        typeof line.price === "number" &&
        Number.isFinite(line.price) &&
        line.price > 0
    );
    const pendingFigures = pendingLines.flatMap(({ price, color }) => {
      if (!yAxis) return [];
      const pendingY = yAxis.convertToPixel(price);
      const lineStartX = bounding.width * 0.2;
      const lineWidth = Math.max(0, bounding.width - lineStartX);
      const sweepWidth = Math.min(60, lineWidth);
      const sweepStartX =
        lineStartX + Math.max(0, lineWidth - sweepWidth) * pendingProgress;
      const sweepAlpha = [0.08, 0.16, 0.28, 0.42, 0.6, 0.42, 0.28, 0.16, 0.08];
      const segmentWidth = sweepWidth / sweepAlpha.length;
      return [
        {
          type: "line" as const,
          zLevel: 51,
          ignoreEvent: true,
          styles: { color, style: "dashed", dashedValue: [5, 3], size: 2 },
          attrs: {
            coordinates: [
              { x: 0, y: pendingY },
              { x: bounding.width, y: pendingY },
            ],
          },
        },
        ...sweepAlpha.map((alpha, index) => ({
          type: "line" as const,
          zLevel: 52,
          ignoreEvent: true,
          styles: { color, size: 2 + alpha * 4 },
          attrs: {
            coordinates: [
              { x: sweepStartX + segmentWidth * index, y: pendingY },
              {
                x: sweepStartX + segmentWidth * (index + 1),
                y: pendingY,
              },
            ],
          },
        })),
      ];
    });
    const protectionActions = position.show_protection_actions
      ? [
          (position.can_show_protection_action ??
            (position.can_set_stop_loss || position.can_set_take_profit)) && {
            type: "text",
            zLevel: 52,
            ignoreEvent: false,
            styles: {
              backgroundColor: "#334155",
              color: "#ffffff",
              size: 12,
            },
            attrs: {
              x: bounding.width * 0.55,
              y: entryY,
              text: "TP/SL",
              baseline: "center",
              role: "protection-tp-sl",
            },
          },
        ].filter(isTruthy)
      : [];

    return [
      {
        type: "line",
        zLevel: 50,
        styles: { color, style: "dashed", dashedValue: [3, 3], size: 2 },
        attrs: {
          role: "protection-line",
          coordinates: [
            { x: 0, y: entryY },
            { x: bounding.width, y: entryY },
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
          y: entryY,
          text: parts.filter(Boolean).join(" | "),
          baseline: "center",
        },
      },
      ...pendingFigures,
      ...protectionActions,
    ].filter(isTruthy);
  },
});
