import { BacktestRunPositionSchema } from "./backtestRunPosition";

export type BacktestRunWithPositionsSchema = {
  id: number;
  name?: string;
  trade_group_id?: number;
  positions?: BacktestRunPositionSchema[];
};
