import { BacktestRunPositionSchema } from "./backtestRunPosition";

export type BacktestRunWithPositionsSchema = {
  id: number;
  name?: string;
  symbol_name?: string;
  symbol_key?: string;
  positions?: BacktestRunPositionSchema[];
};
