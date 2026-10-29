import { useEffect, useRef } from "react";
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
  isActive: boolean;
  showInfo?: boolean;
  canCancel?: boolean;
};
type Props = {
  orders: TradeOrderWithOverlayConfig[];
  history: TradeOrder[];
  positions: TradePosition[];
};

const ACTIVE_ORDER_STATUSES: readonly PositionOrderStatus[] = [
  "new",
  "partially_filled",
  "pending_trigger",
];

function estimateClosePnl(
  order: TradeOrder,
  positions: TradePosition[],
  limitPrice: number,
  symbolKey: string
): number | null {
  if (order.order_type !== "limit") return null;

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
        ? limitPrice - position.entryPrice
        : position.entryPrice - limitPrice) *
        allocatedQuantity
    );
  }, 0);
}

export function KLineChartTradingOrders({ orders, history, positions }: Props) {
  const chart = useChart();
  const { orderHistory: orderHistorySettings } = useChartSettings();
  const symbolKey = useSymbolKey();
  const activeOverlayIds = useRef<Set<string>>(new Set());
  const historyOverlayIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(activeOverlayIds.current);
    orders.forEach((order) => {
      const price = order.price ?? order.stop_price;
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
        isActive: true,
        showInfo: false,
        canCancel: true,
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
  }, [chart, orders, positions, symbolKey]);

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
