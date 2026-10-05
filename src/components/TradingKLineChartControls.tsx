import { SegmentedControl } from "@livtorgex/ui-kit";

import { useChartSettings } from "../context/chartSettings";
import { TIMEFRAMES } from "../constants/app";
import { partialUpdateChartSettings } from "../utils/chart";

type Props = { name: string };

export function TradingKLineChartControls({ name }: Props) {
  const settings = useChartSettings();

  function updateTimeframe(timeframe: number) {
    partialUpdateChartSettings(name, { timeframe });
    window.dispatchEvent(
      new CustomEvent("klinechart:settings-updated", { detail: { name } })
    );
  }

  return (
    <SegmentedControl
      ariaLabel="Chart timeframe"
      value={String(settings.timeframe)}
      onChange={(value: string) => updateTimeframe(Number(value))}
      options={TIMEFRAMES.map(({ label, value }) => ({
        value: String(value),
        label,
      }))}
      size="sm"
      variant="tabs"
      className="border-b border-gray-800 [&_button]:rounded-none [&_button]:px-2 [&_button]:py-1"
    />
  );
}
