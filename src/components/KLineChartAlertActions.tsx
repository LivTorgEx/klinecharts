import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useKLineChartDataAdapter } from "../context/dataAdapterContext";
import { CHART_ALERTS_QUERY_KEY } from "../hooks/api/alertHooks";
import {
  setPendingDrag,
  clearPendingDrag,
} from "../store/alertPendingStore";

export function KLineChartAlertActions() {
  const adapter = useKLineChartDataAdapter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!adapter.updateAlertPrice) {
      return;
    }

    const handleAlertDragged = async (
      event: WindowEventMap["user-alert-dragged"]
    ) => {
      const { alertId, newPrice, oldPrice } = event.detail;
      if (newPrice === oldPrice) return;

      setPendingDrag(alertId, newPrice);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 10_000)
      );

      const updateAndRefetch = (async () => {
        await adapter.updateAlertPrice!(alertId, newPrice);
        await queryClient.refetchQueries({
          queryKey: [CHART_ALERTS_QUERY_KEY],
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
        clearPendingDrag(alertId);
      }
    };

    window.addEventListener("user-alert-dragged", handleAlertDragged);
    return () => {
      window.removeEventListener("user-alert-dragged", handleAlertDragged);
    };
  }, [adapter, queryClient]);

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
