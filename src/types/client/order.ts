import { PositionDirection } from "./direction";
import { OrderSide } from "./direction";

export type PositionOrder = {
  id?: number | string;
  price: number;
  qty: number;
  side: OrderSide;
  created_at?: number;
  order_type?: PositionOrderType;
  stop_price?: number;
  update_at?: number;
  client_id?: number | string;
  original_id?: number | string;
  note?: string | null;
  mark?: string | null;
  status?: PositionOrderStatus;
  qty_filled?: number;
  /** Direction of the parent position (long/short) this order belongs to. */
  position_side?: PositionDirection;
  /** Exchange-reported realized PnL for this order (quote ccy). */
  realized_pnl?: number;
  /** Cumulative trading fee charged for this order (quote ccy). */
  fee?: number;
};

export type PositionOrderType =
  | "market"
  | "limit"
  | "stop_market"
  | "stop_limit"
  | "take_profit"
  | "take_profit_market"
  | "trailing_stop_market";

export type PositionOrderStatus =
  | "new"
  | "partially_filled"
  | "filled"
  | "expired"
  | "canceled"
  | "pending_trigger";

export const PositionOrderType = {
  Market: "market",
  Limit: "limit",
  StopMarket: "stop_market",
  StopLimit: "stop_limit",
} as const;
