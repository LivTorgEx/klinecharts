import type { PositionOrder } from "../order";
import type { PositionDirection } from "../direction";

export type KLineChartPositionStatus =
  | "created"
  | "in_progress"
  | "finishing"
  | "completed"
  | "failed";

export type KLineChartPositionOrder = PositionOrder;

export type KLineChartPosition = {
  id: number | string;
  side: PositionDirection;
  qty: number;
  entry_price: number;
  total_profit: number;
  fee: number;
  status: KLineChartPositionStatus;
  created_at?: number;
  orders: KLineChartPositionOrder[];
};
