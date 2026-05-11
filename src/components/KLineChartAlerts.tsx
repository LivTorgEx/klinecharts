import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useKLineChartDataAdapter } from "../context/dataAdapterContext";
import { useSymbolKey } from "../context/symbolKey";
import {
  CHART_ALERTS_QUERY_KEY,
  useChartAlerts,
} from "../hooks/api/alertHooks";
import type { KLineChartAlertLine } from "../types/client/dataAdapter";

type EffectiveAlertLine = KLineChartAlertLine & { isLoading: boolean };

export function KLineChartAlerts() {
  const chart = useChart();
  const symbolKey = useSymbolKey();
  const adapter = useKLineChartDataAdapter();
  const queryClient = useQueryClient();
  const overlayKeys = useRef<Set<string>>(new Set());

  const { data: fetchedAlerts } = useChartAlerts(symbolKey);

  const [pendingDrags, setPendingDrags] = useState<Map<string, number>>(
    () => new Map()
  );

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
    // Use last candle timestamp when available; fall back to now so overlays
    // can be placed even if chart data hasn't loaded yet (the Y value / price
    // level is what matters for horizontal alert lines).
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

  // Handle drag events: optimistically show loading state, call adapter, refetch.
  useEffect(() => {
    if (!adapter.updateAlertPrice) {
      return;
    }

    const handleAlertDragged = async (
      event: WindowEventMap["user-alert-dragged"]
    ) => {
      const { alertId, newPrice, oldPrice } = event.detail;
      if (newPrice === oldPrice) {
        return;
      }

      setPendingDrags((prev) => new Map(prev).set(alertId, newPrice));

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 10_000)
      );

      // Update then wait for the refetch so the pending state is only cleared
      // once fresh data is in the cache — prevents a flicker back to old price.
      const updateAndRefetch = (async () => {
        await adapter.updateAlertPrice!(alertId, newPrice);
        await queryClient.refetchQueries({
          queryKey: [CHART_ALERTS_QUERY_KEY, { symbolKey, source: "chart" }],
        });
      })();

      try {
        await Promise.race([updateAndRefetch, timeoutPromise]);
      } catch (err) {
        if (err instanceof Error && err.message === "timeout") {
          adapter.onAlertError?.(
            "Alert update timed out — reverting to original price."
          );
        } else {
          adapter.onAlertError?.("Failed to update alert price.");
        }
      } finally {
        setPendingDrags((prev) => {
          const next = new Map(prev);
          next.delete(alertId);
          return next;
        });
      }
    };

    window.addEventListener("user-alert-dragged", handleAlertDragged);
    return () => {
      window.removeEventListener("user-alert-dragged", handleAlertDragged);
    };
  }, [adapter, queryClient, symbolKey]);

  // Handle delete events: call adapter, then refetch all alert queries.
  useEffect(() => {
    if (!adapter.deleteAlert) {
      return;
    }

    const handleAlertDelete = async (
      event: WindowEventMap["user-alert-delete"]
    ) => {
      const { alertId } = event.detail;

      try {
        await adapter.deleteAlert!(alertId);
        await queryClient.refetchQueries({
          queryKey: [CHART_ALERTS_QUERY_KEY],
        });
      } catch {
        adapter.onAlertError?.("Failed to delete alert.");
      }
    };

    window.addEventListener("user-alert-delete", handleAlertDelete);
    return () => {
      window.removeEventListener("user-alert-delete", handleAlertDelete);
    };
  }, [adapter, queryClient]);

  return null;
}
