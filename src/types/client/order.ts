import { PositionDirection } from "./direction";
import { OrderSide } from "./direction";

export type PositionOrder = {
  id?: number | string;
  price: number;
  qty: number;
  side: OrderSide;
  created_at?: number;
  order_type?: string;
  stop_price?: number;
  update_at?: number;
  client_id?: number | string;
  original_id?: number | string;
  note?: string | null;
  mark?: string | null;
  status?: string;
  qty_filled?: number;
  /** Direction of the parent position (LONG/SHORT) this order belongs to. */
  position_side?: PositionDirection;
  /** Exchange-reported realized PnL for this order (quote ccy). */
  realized_pnl?: number;
  /** Cumulative trading fee charged for this order (quote ccy). */
  fee?: number;
};

export type PositionOrderType =
  | "MARKET"
  | "LIMIT"
  | "STOP_MARKET"
  | "STOP_LIMIT"
  | string;

export const PositionOrderType = {
  Market: "MARKET",
  Limit: "LIMIT",
  StopMarket: "STOP_MARKET",
  StopLimit: "STOP_LIMIT",
} as const;
