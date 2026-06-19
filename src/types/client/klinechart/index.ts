import type { PositionOrder } from "../order";

export type KLineChartPositionStatus =
  | "Created"
  | "InProgress"
  | "Finishing"
  | "Completed"
  | "Failed";

export type KLineChartPositionOrder = PositionOrder;

export type KLineChartPosition = {
  id: number | string;
  side: string;
  qty: number;
  entry_price: number;
  total_profit: number;
  fee: number;
  status: KLineChartPositionStatus;
  created_at: string;
  orders: KLineChartPositionOrder[];
};
