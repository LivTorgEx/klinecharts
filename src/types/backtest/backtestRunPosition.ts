import { PositionOrder } from "../client/order";

export type BacktestRunPositionSchema = {
  id: number;
  orders: PositionOrder[];
  side: string;
  total_profit: number;
  fee: number;
};
