import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";

type Props = {
  chartRef: RefObject<HTMLDivElement | null>;
  chartHeight: number;
  tokenPresent: boolean;
  chartInfo?: ReactNode;
};

export function KLineChartViewport({
  chartRef,
  chartHeight,
  tokenPresent,
  chartInfo,
}: Props) {
  const chartInfoRef = useRef<HTMLDivElement>(null);
  const [chartInfoHeight, setChartInfoHeight] = useState(0);

  useEffect(() => {
    const element = chartInfoRef.current;
    if (!element || !chartInfo) {
      return;
    }

    const updateHeight = () => {
      setChartInfoHeight(element.getBoundingClientRect().height);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    updateHeight();

    return () => observer.disconnect();
  }, [chartInfo]);

  return (
    <div
      className="relative min-h-0 w-full"
      style={{ height: chartHeight, minHeight: 0 }}
    >
      {tokenPresent ? (
        <>
          {chartInfo ? (
            <div ref={chartInfoRef} className="relative z-10 w-full px-2 py-1">
              {chartInfo}
            </div>
          ) : null}
          <div
            ref={chartRef}
            className="min-h-0 w-full"
            style={{
              height: Math.max(
                0,
                chartHeight - (chartInfo ? chartInfoHeight : 0)
              ),
            }}
          />
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Select a market to load chart data.
        </div>
      )}
    </div>
  );
}
