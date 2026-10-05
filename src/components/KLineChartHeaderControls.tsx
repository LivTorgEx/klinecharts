import type { ReactNode } from "react";
import { Text } from "@livtorgex/ui-kit";
import { KLineDataLoader } from "./KLineDataLoader";
import { KLineChartOrderBook } from "./KLineChartOrderBook";
import { TradingKLineChartControls } from "./TradingKLineChartControls";
import { IndicatorSelector } from "./IndicatorSelector";
import { IndicatorEditDialog } from "./IndicatorEditDialog";
import { KLineChartSettingsModal } from "../settings/KLineChartSettingsModal";
import type { Chart } from "klinecharts";

type Props = {
  chart: Chart | null;
  chartSettingName: string;
  timeframe: number;
  tokenSymbolKey?: string;
  enableRealTime: boolean;
  timeEndLoader?: number;
  headerActions?: ReactNode;
  children?: ReactNode;
  editIndicatorId: string | null;
  onEditIndicatorComplete: () => void;
};

export function KLineChartHeaderControls({
  chart,
  chartSettingName,
  timeframe,
  tokenSymbolKey,
  enableRealTime,
  timeEndLoader,
  headerActions,
  children,
  editIndicatorId,
  onEditIndicatorComplete,
}: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 border-b border-gray-800 bg-black px-2 py-1.5">
      <TradingKLineChartControls name={chartSettingName} />
      <IndicatorSelector name={chartSettingName} chart={chart} />
      <IndicatorEditDialog
        key={editIndicatorId ?? "closed"}
        name={chartSettingName}
        chart={chart}
        indicatorId={editIndicatorId}
        onClose={onEditIndicatorComplete}
      />
      <KLineChartSettingsModal name={chartSettingName} />
      <KLineChartOrderBook
        symbolKey={tokenSymbolKey}
        enabled={enableRealTime}
      />
      {tokenSymbolKey ? (
        <KLineDataLoader
          timeframe={timeframe}
          symbolKey={tokenSymbolKey}
          timeEndLoader={timeEndLoader}
          symbol={tokenSymbolKey}
          enableRealTime={enableRealTime}
        />
      ) : null}
      {headerActions}
      {children}
      {tokenSymbolKey ? null : (
        <Text variant="caption" tone="muted">
          Select a market to load chart data.
        </Text>
      )}
    </div>
  );
}
