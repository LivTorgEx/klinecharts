import type { OrderSide, PositionDirection } from "./direction";
import type { PositionOrderStatus, PositionOrderType } from "./order";

export type TradePosition = {
  position_id: string;
  symbol_key: string;
  position_side: PositionDirection;
  quantity: number;
  entry_price: number;
  mark_price: number | null;
  unrealized_pnl: number | null;
  captured_at: number;
};

export type TradePositionHistory = {
  position_id: string;
  symbol_key: string;
  position_side: PositionDirection;
  quantity: number;
  entry_price: number;
  exit_price: number;
  open_at: number | string;
  closed_at: number | string;
  exit_type: string | null;
  fee: number;
  realized_profit: number;
  cost: number;
};

export type TradeOrder = {
  external_order_id: string;
  chart_overlay_key?: string;
  client_order_id: string | null;
  symbol_key: string;
  side: OrderSide;
  position_side: PositionDirection | null;
  order_type: PositionOrderType;
  status: PositionOrderStatus;
  quantity: number;
  filled_quantity: number;
  price: number | null;
  average_price: number | null;
  stop_price: number | null;
  commission: number | null;
  realized_profit: number | null;
  created_at: number;
  updated_at: number;
};
