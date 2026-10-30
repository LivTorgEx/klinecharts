import { useEffect, useRef, useState } from "react";
import type { Overlay, OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useChartSettings } from "../context/chartSettings";
import { useSymbolKey } from "../context/symbolKey";
import { PositionDirection } from "../types/client/direction";
import type {
  TradePosition,
  TradePositionHistory,
} from "../types/client/trade";
import {
  getProtectionPreviewOverlayId,
  type TradePositionOverlayData,
} from "../overlays/tradePosition";

type TradePositionHistoryOverlayData = Pick<
  TradePositionHistory,
  "position_side" | "quantity" | "realized_profit"
> & {
  showInfo?: boolean;
};
type TradingPosition = TradePosition & {
  reference_price?: number;
  has_active_stop_loss?: boolean;
  has_active_take_profit?: boolean;
};
type PendingAmendments = Record<string, number>;
type ProtectionPreviewOverlayData = {
  order_type: "stop_market" | "take_profit_market";
  amend_progress: number;
  awaiting_response?: boolean;
};
type Props = {
  positions: TradingPosition[];
  history: TradePositionHistory[];
  canCreateProtection?: boolean;
  supportedPositionSides?: string[];
  pendingAmendments?: PendingAmendments;
};

const EMPTY_PENDING_AMENDMENTS: PendingAmendments = {};

function toTimestamp(value: number | string) {
  return typeof value === "number" ? value : Date.parse(value);
}

export function KLineChartTradingPositions({
  positions,
  history,
  canCreateProtection = false,
  supportedPositionSides,
  pendingAmendments = EMPTY_PENDING_AMENDMENTS,
}: Props) {
  const chart = useChart();
  const { position: positionSettings } = useChartSettings();
  const symbolKey = useSymbolKey();
  const positionOverlayIds = useRef<Set<string>>(new Set());
  const historyOverlayIds = useRef<Set<string>>(new Set());
  const [pendingProgress, setPendingProgress] = useState(0);
  const hasPendingProtection = Object.keys(pendingAmendments).some((key) =>
    key.startsWith("position-protection:")
  );

  useEffect(() => {
    if (
      !hasPendingProtection ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setPendingProgress((progress) => (progress + 0.04) % 1);
    }, 48);
    return () => window.clearInterval(timer);
  }, [hasPendingProtection]);

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(positionOverlayIds.current);
    const lastCandle = chart.getDataList();
    const fallbackTimestamp =
      lastCandle[lastCandle.length - 1]?.timestamp ?? Date.now();

    positions.forEach((position) => {
      if (
        position.symbol_key !== symbolKey ||
        position.quantity === 0 ||
        position.entry_price <= 0
      ) {
        return;
      }

      const id = `trade_position_${position.position_id}`;
      const points: OverlayCreate["points"] = [
        {
          timestamp: position.captured_at || fallbackTimestamp,
          value: position.entry_price,
        },
      ];
      const overlay = chart.getOverlays({ id })[0] as
        | Overlay<TradePositionOverlayData>
        | undefined;
      if (overlay?.extendData.dragging_protection) {
        positionOverlayIds.current.add(id);
        removeSet.delete(id);
        return;
      }
      const previewId = getProtectionPreviewOverlayId(position.position_id);
      const protectionPreview = chart.getOverlays({ id: previewId })[0] as
        | Overlay<ProtectionPreviewOverlayData>
        | undefined;
      const previewOrderType = protectionPreview?.extendData.order_type;
      const previewPendingPrice =
        previewOrderType === "stop_market"
          ? pendingAmendments[
              `position-protection:${position.position_id}:stop_market`
            ]
          : previewOrderType === "take_profit_market"
            ? pendingAmendments[
                `position-protection:${position.position_id}:take_profit_market`
              ]
            : undefined;
      const hasMatchingActiveProtection =
        (previewOrderType === "stop_market" && position.has_active_stop_loss) ||
        (previewOrderType === "take_profit_market" &&
          position.has_active_take_profit);
      const keepProtectionPreview =
        protectionPreview?.extendData.awaiting_response === true &&
        previewPendingPrice != null &&
        !hasMatchingActiveProtection;
      const supportsPositionSide =
        !supportedPositionSides?.length ||
        supportedPositionSides.includes(position.position_side);
      const extendData: TradePositionOverlayData = {
        position_side:
          position.position_side === PositionDirection.BOTH
            ? position.quantity >= 0
              ? PositionDirection.LONG
              : PositionDirection.SHORT
            : position.position_side,
        quantity: Math.abs(position.quantity),
        entry_price: position.entry_price,
        reference_price: position.reference_price ?? position.entry_price,
        entry_timestamp: position.captured_at || fallbackTimestamp,
        unrealized_pnl: position.unrealized_pnl,
        position_id: position.position_id,
        symbol_key: position.symbol_key,
        pending_stop_loss_price: position.has_active_stop_loss
          ? undefined
          : keepProtectionPreview && previewOrderType === "stop_market"
            ? undefined
            : pendingAmendments[
                `position-protection:${position.position_id}:stop_market`
              ],
        pending_take_profit_price: position.has_active_take_profit
          ? undefined
          : keepProtectionPreview && previewOrderType === "take_profit_market"
            ? undefined
            : pendingAmendments[
                `position-protection:${position.position_id}:take_profit_market`
              ],
        pending_progress: pendingProgress,
        can_set_stop_loss:
          canCreateProtection &&
          supportsPositionSide &&
          !position.has_active_stop_loss &&
          pendingAmendments[
            `position-protection:${position.position_id}:stop_market`
          ] == null,
        can_set_take_profit:
          canCreateProtection &&
          supportsPositionSide &&
          !position.has_active_take_profit &&
          pendingAmendments[
            `position-protection:${position.position_id}:take_profit_market`
          ] == null,
        show_protection_actions:
          overlay?.extendData.show_protection_actions ?? false,
        dragging_protection: overlay?.extendData.dragging_protection ?? false,
        has_dragged_protection:
          overlay?.extendData.has_dragged_protection ?? false,
      };

      if (overlay) {
        chart.overrideOverlay({ id, points, extendData });
      } else {
        chart.createOverlay({
          name: "tradePosition",
          id,
          points,
          lock: false,
          extendData,
        });
      }
      if (protectionPreview?.extendData.awaiting_response) {
        if (keepProtectionPreview) {
          chart.overrideOverlay({
            id: previewId,
            extendData: {
              ...protectionPreview.extendData,
              amend_progress: pendingProgress,
            },
          });
        } else {
          chart.removeOverlay({ id: previewId });
        }
      }

      positionOverlayIds.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      chart.removeOverlay({
        id: getProtectionPreviewOverlayId(id.slice("trade_position_".length)),
      });
      positionOverlayIds.current.delete(id);
    });
  }, [
    canCreateProtection,
    chart,
    pendingAmendments,
    pendingProgress,
    positions,
    supportedPositionSides,
    symbolKey,
  ]);

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(historyOverlayIds.current);
    (positionSettings.showFinished ? history : []).forEach((position) => {
      if (position.symbol_key !== symbolKey) return;

      const startTimestamp = toTimestamp(position.open_at);
      const endTimestamp = toTimestamp(position.closed_at);
      if (
        !Number.isFinite(startTimestamp) ||
        !Number.isFinite(endTimestamp) ||
        position.entry_price <= 0 ||
        position.exit_price <= 0
      ) {
        return;
      }

      const id = `trade_position_history_${position.position_id}_${startTimestamp}_${endTimestamp}`;
      const points: OverlayCreate["points"] = [
        { timestamp: startTimestamp, value: position.entry_price },
        { timestamp: endTimestamp, value: position.exit_price },
      ];
      const extendData: TradePositionHistoryOverlayData = {
        position_side: position.position_side,
        quantity: Math.abs(position.quantity),
        realized_profit: position.realized_profit,
        showInfo: false,
      };

      if (chart.getOverlays({ id }).length) {
        chart.overrideOverlay({ id, points, extendData });
      } else {
        chart.createOverlay({
          name: "tradePositionHistory",
          id,
          points,
          lock: true,
          extendData,
        });
      }

      historyOverlayIds.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      historyOverlayIds.current.delete(id);
    });
  }, [chart, history, positionSettings.showFinished, symbolKey]);

  useEffect(
    () => () => {
      if (!chart) return;
      positionOverlayIds.current.forEach((id) => {
        chart.removeOverlay({ id });
        chart.removeOverlay({
          id: getProtectionPreviewOverlayId(id.slice("trade_position_".length)),
        });
      });
      historyOverlayIds.current.forEach((id) => chart.removeOverlay({ id }));
      positionOverlayIds.current.clear();
      historyOverlayIds.current.clear();
    },
    [chart]
  );

  return null;
}
