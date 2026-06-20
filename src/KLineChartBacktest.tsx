import { useSymbolKeyFromAll } from "./hooks/api/symbolHooks";
import { BacktestRunWithPositionsSchema } from "./types/backtest/backtestRun";
import { KLineChart } from "./KLineChart";
import { KLineChartBacktestPositions } from "./position/KLineChartBacktestPositions";

type Props = {
  backtestRun: BacktestRunWithPositionsSchema;
  timeEndLoader?: number;
};

export function KLineChartBacktest({ backtestRun, timeEndLoader }: Props) {
  const token = useSymbolKeyFromAll(backtestRun.symbol_key);

  if (!token) {
    return null;
  }

  return (
    <KLineChart
      token={token}
      chartSettingName="backtest"
      timeEndLoader={timeEndLoader}
      enableRealTime={false}
      height={600}
    >
      <KLineChartBacktestPositions positions={backtestRun.positions ?? []} />
    </KLineChart>
  );
}
