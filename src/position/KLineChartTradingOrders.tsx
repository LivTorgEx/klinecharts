import { useEffect, useRef, useState } from "react";
import type { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useChartSettings } from "../context/chartSettings";
import { useSymbolKey } from "../context/symbolKey";
import { OrderSide, PositionDirection } from "../types/client/direction";
import type { PositionOrderStatus } from "../types/client/order";
import type { TradeOrder, TradePosition } from "../types/client/trade";

type TradeOrderWithOverlayConfig = TradeOrder & {
  sticky?: boolean;
  trigger_order_id?: string | null;
  trigger_algo_order_id?: string | null;
};
type TradeOrderOverlayData = TradeOrderWithOverlayConfig & {
  display_price: number;
  close_pnl: number | null;
  sticky: boolean;
  amendable: boolean;
  amending: boolean;
  amend_progress: number;
  isActive: boolean;
  showInfo?: boolean;
  canCancel?: boolean;
};
type Props = {
  orders: TradeOrderWithOverlayConfig[];
  history: TradeOrder[];
  positions: TradePosition[];
  canAmendOrders?: boolean;
  pendingAmendments?: Record<string, number>;
};

const EMPTY_PENDING_AMENDMENTS: Record<string, number> = {};

const ACTIVE_ORDER_STATUSES: readonly PositionOrderStatus[] = [
  "new",
  "partially_filled",
  "pending_trigger",
];
const PNL_ORDER_TYPES = new Set([
  "limit",
  "stop_market",
  "stop_limit",
  "take_profit",
  "take_profit_market",
]);

function estimateClosePnl(
  order: TradeOrder,
  positions: TradePosition[],
  targetPrice: number,
  symbolKey: string
): number | null {
  if (!PNL_ORDER_TYPES.has(order.order_type)) return null;

  const candidates = positions.flatMap((position) => {
    if (
      position.symbol_key !== symbolKey ||
      position.entry_price <= 0 ||
      position.quantity === 0
    ) {
      return [];
    }

    const direction =
      position.position_side === PositionDirection.BOTH
        ? position.quantity > 0
          ? PositionDirection.LONG
          : PositionDirection.SHORT
        : position.position_side;
    const closesDirection =
      (direction === PositionDirection.LONG && order.side === OrderSide.SELL) ||
      (direction === PositionDirection.SHORT && order.side === OrderSide.BUY);
    const matchesOrderPositionSide =
      order.position_side == null ||
      order.position_side === PositionDirection.BOTH ||
      order.position_side === direction;

    return closesDirection && matchesOrderPositionSide
      ? [
          {
            direction,
            quantity: Math.abs(position.quantity),
            entryPrice: position.entry_price,
          },
        ]
      : [];
  });

  const availableQuantity = candidates.reduce(
    (total, position) => total + position.quantity,
    0
  );
  const remainingOrderQuantity = Math.max(
    order.quantity - order.filled_quantity,
    0
  );
  const closeQuantity = Math.min(availableQuantity, remainingOrderQuantity);
  if (closeQuantity <= 0 || availableQuantity <= 0) return null;

  return candidates.reduce((pnl, position) => {
    const allocatedQuantity =
      (closeQuantity * position.quantity) / availableQuantity;
    return (
      pnl +
      (position.direction === PositionDirection.LONG
        ? targetPrice - position.entryPrice
        : position.entryPrice - targetPrice) *
        allocatedQuantity
    );
  }, 0);
}

export function KLineChartTradingOrders({
  orders,
  history,
  positions,
  canAmendOrders = false,
  pendingAmendments = EMPTY_PENDING_AMENDMENTS,
}: Props) {
  const chart = useChart();
  const { orderHistory: orderHistorySettings } = useChartSettings();
  const symbolKey = useSymbolKey();
  const activeOverlayIds = useRef<Set<string>>(new Set());
  const historyOverlayIds = useRef<Set<string>>(new Set());
  const [amendProgress, setAmendProgress] = useState(0);
  const hasPendingAmendments = Object.keys(pendingAmendments).length > 0;

  useEffect(() => {
    if (
      !hasPendingAmendments ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setAmendProgress((progress) => (progress + 0.04) % 1);
    }, 48);
    return () => window.clearInterval(timer);
  }, [hasPendingAmendments]);

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(activeOverlayIds.current);
    orders.forEach((order) => {
      const hasPendingAmendment = Object.prototype.hasOwnProperty.call(
        pendingAmendments,
        order.external_order_id
      );
      const price =
        pendingAmendments[order.external_order_id] ??
        order.price ??
        order.stop_price;
      if (
        order.symbol_key !== symbolKey ||
        !ACTIVE_ORDER_STATUSES.includes(order.status) ||
        order.quantity <= 0 ||
        price == null ||
        price <= 0
      ) {
        return;
      }

      const id = `trade_order_${order.chart_overlay_key ?? order.external_order_id}`;
      const points: OverlayCreate["points"] = [
        {
          timestamp: order.updated_at || order.created_at,
          value: price,
        },
      ];
      const extendData: TradeOrderOverlayData = {
        ...order,
        display_price: price,
        close_pnl: estimateClosePnl(order, positions, price, symbolKey),
        sticky: order.sticky ?? false,
        amending: hasPendingAmendment,
        amend_progress: amendProgress,
        amendable:
          canAmendOrders &&
          !hasPendingAmendment &&
          order.order_type === "limit" &&
          !order.trigger_order_id &&
          !order.trigger_algo_order_id,
        isActive: true,
        showInfo: false,
        canCancel: !hasPendingAmendment,
      };

      if (chart.getOverlays({ id }).length) {
        chart.overrideOverlay({ id, points, extendData });
      } else {
        chart.createOverlay({
          name: "tradeOrder",
          id,
          points,
          lock: false,
          extendData,
        });
      }

      activeOverlayIds.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      activeOverlayIds.current.delete(id);
    });
  }, [
    amendProgress,
    canAmendOrders,
    chart,
    orders,
    pendingAmendments,
    positions,
    symbolKey,
  ]);

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(historyOverlayIds.current);
    (orderHistorySettings.show ? history : []).forEach((order) => {
      const price = order.average_price ?? order.price ?? order.stop_price;
      if (
        order.symbol_key !== symbolKey ||
        ACTIVE_ORDER_STATUSES.includes(order.status) ||
        order.status === "canceled" ||
        order.quantity <= 0 ||
        price == null ||
        price <= 0
      ) {
        return;
      }

      const id = `trade_order_history_${order.external_order_id}`;
      const points: OverlayCreate["points"] = [
        {
          timestamp: order.updated_at || order.created_at,
          value: price,
        },
      ];
      const extendData: TradeOrderOverlayData = {
        ...order,
        display_price: price,
        close_pnl: null,
        sticky: false,
        amendable: false,
        amending: false,
        amend_progress: 0,
        isActive: false,
        showInfo: false,
        canCancel: false,
      };

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

      historyOverlayIds.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      historyOverlayIds.current.delete(id);
    });
  }, [chart, history, orderHistorySettings.show, symbolKey]);

  useEffect(
    () => () => {
      if (!chart) return;
      activeOverlayIds.current.forEach((id) => chart.removeOverlay({ id }));
      historyOverlayIds.current.forEach((id) => chart.removeOverlay({ id }));
      activeOverlayIds.current.clear();
      historyOverlayIds.current.clear();
    },
    [chart]
  );

  return null;
}
