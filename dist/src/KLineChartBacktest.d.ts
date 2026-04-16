import { BacktestRunWithPositionsSchema } from "./types/backtest/backtestRun";
type Props = {
    backtestRun: BacktestRunWithPositionsSchema;
    timeEndLoader?: number;
};
export declare function KLineChartBacktest({ backtestRun, timeEndLoader }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
