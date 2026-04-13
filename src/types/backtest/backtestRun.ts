export type BacktestRunWithPositionsSchema = {
  id: number;
  name?: string;
  positions?: Array<Record<string, unknown>>;
};
