import { useEffect, useRef } from "react";
import type { Overlay, OverlayCreate } from "klinecharts";

import { useChart } from "../context/chart";
import { useChartSettings } from "../context/chartSettings";
import { useSymbolKey } from "../context/symbolKey";
import { PositionDirection } from "../types/client/direction";
import type {
  TradePosition,
  TradePositionHistory,
} from "../types/client/trade";
import type { TradePositionOverlayData } from "../overlays/tradePosition";

type TradePositionHistoryOverlayData = Pick<
  TradePositionHistory,
  "position_side" | "quantity" | "realized_profit"
>;
type Props = {
  positions: TradePosition[];
  history: TradePositionHistory[];
};

export function KLineChartTradingPositions({ positions, history }: Props) {
  const chart = useChart();
  const { position: positionSettings } = useChartSettings();
  const symbolKey = useSymbolKey().trim().toUpperCase();
  const positionOverlayIds = useRef<Set<string>>(new Set());
  const historyOverlayIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(positionOverlayIds.current);
    const lastCandle = chart.getDataList();
    const fallbackTimestamp =
      lastCandle[lastCandle.length - 1]?.timestamp ?? Date.now();

    positions.forEach((position) => {
      if (
        position.symbol_key.trim().toUpperCase() !== symbolKey ||
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
      const extendData: TradePositionOverlayData = {
        position_side:
          position.position_side === PositionDirection.BOTH
            ? position.quantity >= 0
              ? PositionDirection.LONG
              : PositionDirection.SHORT
            : position.position_side,
        quantity: Math.abs(position.quantity),
        entry_price: position.entry_price,
        unrealized_pnl: position.unrealized_pnl,
        showInfo: false,
      };
      const overlay = chart.getOverlays({ id })[0] as
        | Overlay<TradePositionOverlayData>
        | undefined;

      if (overlay) {
        chart.overrideOverlay({ id, points, extendData });
      } else {
        chart.createOverlay({
          name: "tradePosition",
          id,
          points,
          lock: true,
          extendData,
        });
      }

      positionOverlayIds.current.add(id);
      removeSet.delete(id);
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
      positionOverlayIds.current.delete(id);
    });
  }, [chart, positions, symbolKey]);

  useEffect(() => {
    if (!chart) return;

    const removeSet = new Set(historyOverlayIds.current);
    (positionSettings.showFinished ? history : []).forEach((position) => {
      if (position.symbol_key.trim().toUpperCase() !== symbolKey) return;

      const startTimestamp = Date.parse(position.open_at);
      const endTimestamp = Date.parse(position.closed_at);
      if (
        !Number.isFinite(startTimestamp) ||
        !Number.isFinite(endTimestamp) ||
        position.entry_price <= 0 ||
        position.exit_price <= 0
      ) {
        return;
      }

      const id = `trade_position_history_${position.position_id}`;
      const points: OverlayCreate["points"] = [
        { timestamp: startTimestamp, value: position.entry_price },
        { timestamp: endTimestamp, value: position.exit_price },
      ];
      const extendData: TradePositionHistoryOverlayData = {
        position_side: position.position_side,
        quantity: Math.abs(position.quantity),
        realized_profit: position.realized_profit,
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
      positionOverlayIds.current.forEach((id) => chart.removeOverlay({ id }));
      historyOverlayIds.current.forEach((id) => chart.removeOverlay({ id }));
      positionOverlayIds.current.clear();
      historyOverlayIds.current.clear();
    },
    [chart]
  );

  return null;
}
