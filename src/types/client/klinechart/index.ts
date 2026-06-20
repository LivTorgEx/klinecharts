import type { PositionOrder } from "../order";
import type { PositionDirection } from "../direction";

export type KLineChartPositionStatus =
  | "Created"
  | "InProgress"
  | "Finishing"
  | "Completed"
  | "Failed";

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
