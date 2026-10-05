import type { RefObject } from "react";

type Props = {
  chartRef: RefObject<HTMLDivElement | null>;
  chartHeight: number;
  tokenPresent: boolean;
};

export function KLineChartViewport({ chartRef, chartHeight, tokenPresent }: Props) {
  return (
    <div
      className="relative min-h-0 w-full"
      style={{ height: chartHeight, minHeight: 0 }}
    >
      {tokenPresent ? (
        <div ref={chartRef} className="h-full min-h-0 w-full" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Select a market to load chart data.
        </div>
      )}
    </div>
  );
}
