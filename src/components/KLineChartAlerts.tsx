import { useEffect, useMemo, useRef } from "react";
import type { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useSymbolKey } from "../context/symbolKey";
import { useChartAlerts } from "../hooks/api/alertHooks";
import type { KLineChartAlertLine } from "../types/client/dataAdapter";
import { usePendingDrags } from "../store/alertPendingStore";

type EffectiveAlertLine = KLineChartAlertLine & { isLoading: boolean };

export function KLineChartAlerts() {
  const chart = useChart();
  const symbolKey = useSymbolKey();
  const overlayKeys = useRef<Set<string>>(new Set());

  const { data: fetchedAlerts } = useChartAlerts(symbolKey);
  const pendingDrags = usePendingDrags();

  const effectiveAlerts = useMemo<EffectiveAlertLine[]>(
    () =>
      (fetchedAlerts ?? []).map((alert) => {
        const pendingPrice = pendingDrags.get(alert.id);
        return pendingPrice !== undefined
          ? { ...alert, price: pendingPrice, isLoading: true }
          : { ...alert, isLoading: false };
      }),
    [fetchedAlerts, pendingDrags]
  );

  // Sync overlays when effective alerts or chart instance changes.
  useEffect(() => {
    if (!chart) {
      return;
    }

    const removeSet = new Set(overlayKeys.current);
    const dataList = chart.getDataList();
    const lastCandle = dataList[dataList.length - 1];
    const anchorTimestamp = lastCandle?.timestamp ?? Date.now();

    effectiveAlerts.forEach((alert) => {
      const id = `alert_${alert.id}`;
      const points: OverlayCreate["points"] = [
        { timestamp: anchorTimestamp, value: alert.price },
      ];
      const extendData = {
        id: alert.id,
        price: alert.price,
        label: alert.label,
        color: alert.color,
        isLoading: alert.isLoading,
      };

      if (chart.getOverlays({ id }).length) {
        chart.overrideOverlay({ id, points, extendData });
      } else {
        chart.createOverlay({
          name: "alert",
          id,
          points,
          lock: false,
          extendData,
        });
      }

      overlayKeys.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      overlayKeys.current.delete(id);
    });
  }, [effectiveAlerts, chart]);

  // Clean up all overlays when the chart instance is replaced.
  useEffect(() => {
    if (!chart) {
      return;
    }

    const overlayIds = overlayKeys.current;

    return () => {
      overlayIds.forEach((id) => {
        chart.removeOverlay({ id });
      });
      overlayIds.clear();
    };
  }, [chart]);

  return null;
}
