import { useEffect } from "react";
import { Chart, Nullable } from "klinecharts";

export type SyncedCursor = {
  timestamp: number;
  price: number;
  source: string;
};

type Props = {
  chart: Nullable<Chart>;
  selectedTime?: number;
  selectedPrice?: number;
  themeMode?: "light" | "dark";
};

export function KLineCrossSync({
  chart,
  selectedTime,
  selectedPrice,
  themeMode = "dark",
}: Props) {
  const lineColor = themeMode === "dark" ? "#929AA5" : "#76808F";
  // Render synced cross overlays
  useEffect(() => {
    const currentChart = chart;
    const verticalOverlayId = "synced-crosshair-vertical-line";
    const horizontalOverlayId = "synced-crosshair-horizontal-line";

    if (!currentChart) {
      return;
    }

    if (!selectedTime || selectedPrice === undefined) {
      currentChart.removeOverlay({ id: verticalOverlayId });
      currentChart.removeOverlay({ id: horizontalOverlayId });
      return;
    }

    let retryTimer: number | undefined;

    const syncOverlay = () => {
      const activeChart = currentChart;
      if (!activeChart || !selectedTime) {
        return true;
      }

      const dataList = activeChart.getDataList();
      if (!Array.isArray(dataList) || dataList.length === 0) {
        return false;
      }

      let lo = 0;
      let hi = dataList.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (dataList[mid].timestamp < selectedTime) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      let nearest = dataList[lo];
      if (lo > 0) {
        const prev = dataList[lo - 1];
        if (
          Math.abs(prev.timestamp - selectedTime) <
          Math.abs(nearest.timestamp - selectedTime)
        ) {
          nearest = prev;
        }
      }

      const verticalPoints = [
        {
          timestamp: nearest.timestamp,
          value: nearest.close,
        },
      ];
      const horizontalPoints = [
        {
          timestamp: nearest.timestamp,
          value: selectedPrice,
        },
      ];
      const verticalExists =
        activeChart.getOverlays({ id: verticalOverlayId }).length > 0;
      const horizontalExists =
        activeChart.getOverlays({ id: horizontalOverlayId }).length > 0;

      if (verticalExists) {
        activeChart.overrideOverlay({
          id: verticalOverlayId,
          points: verticalPoints,
        });
      } else {
        activeChart.createOverlay({
          id: verticalOverlayId,
          name: "verticalStraightLine",
          points: verticalPoints,
          lock: true,
          styles: {
            line: {
              style: "dashed",
              dashedValue: [4, 2],
              color: lineColor,
              size: 1,
            },
          },
        });
      }

      if (horizontalExists) {
        activeChart.overrideOverlay({
          id: horizontalOverlayId,
          points: horizontalPoints,
        });
      } else {
        activeChart.createOverlay({
          id: horizontalOverlayId,
          name: "horizontalStraightLine",
          points: horizontalPoints,
          lock: true,
          styles: {
            line: {
              style: "dashed",
              dashedValue: [4, 2],
              color: lineColor,
              size: 1,
            },
          },
        });
      }

      return true;
    };

    const ensureOverlay = () => {
      const applied = syncOverlay();
      if (!applied) {
        retryTimer = window.setTimeout(ensureOverlay, 120);
      }
    };

    ensureOverlay();

    return () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [chart, lineColor, selectedPrice, selectedTime]);

  return null;
}
