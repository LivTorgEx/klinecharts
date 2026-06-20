import { useEffect, useRef } from "react";
import { OverlayCreate } from "klinecharts";

import { useBotPositions } from "../hooks/api/botPositionHooks";
import { useChart } from "../context/chart";
import { useChartSettings } from "../context/chartSettings";

type Props = {
  botId: number;
  symbolKey?: string;
};

export function KLineChartFinishedPositions({ botId, symbolKey }: Props) {
  const chart = useChart();
  const { timeframe } = useChartSettings();
  const { data: positions } = useBotPositions({
    bot_id: botId,
    symbol_key: symbolKey,
    status: ["Completed"],
    order_status: ["Filled"],
  });
  const existingKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!chart) {
      return;
    }

    const removeSet = new Set(existingKeys.current);
    positions?.data?.forEach((position) => {
      const posId = `position_${position.id}`;
      const firstOrder = position.orders[0];
      const lastOrder = position.orders[position.orders.length - 1];
      const startTimestamp = firstOrder?.update_at;
      if (startTimestamp === undefined) {
        return;
      }
      const points: OverlayCreate["points"] = [
        {
          timestamp: startTimestamp,
          value: firstOrder.price || lastOrder.stop_price,
        },
      ];
      if (lastOrder) {
        if (lastOrder.update_at === undefined) {
          return;
        }
        points.push({
          timestamp: lastOrder.update_at,
          value: lastOrder.price || lastOrder.stop_price,
        });
      }
      const posExtendData = {
        side: position.side,
        pnl: position.total_profit - position.fee,
      };
      if (chart.getOverlays({ id: posId }).length) {
        chart.overrideOverlay({ id: posId, points, extendData: posExtendData });
      } else {
        chart.createOverlay({
          name: "positionFilled",
          id: posId,
          points,
          extendData: posExtendData,
        });
      }

      existingKeys.current.add(posId);
      removeSet.delete(posId);

      position.orders.forEach((order) => {
        const timestamp = order.update_at;
        if (timestamp === undefined) {
          return;
        }
        const points: OverlayCreate["points"] = [
          {
            timestamp,
            value: order.price || order.stop_price,
          },
        ];
        const id = `order_${order.id}`;
        if (!chart.getOverlays({ id }).length) {
          chart.createOverlay({
            name: "orderFilled",
            id,
            points,
            extendData: { ...order, timestamp, timeframe },
          });
        }
        existingKeys.current.add(id);
        removeSet.delete(id);
      });
    });

    removeSet.forEach((id) => {
      chart.removeOverlay({ id });
    });
  }, [positions, chart, timeframe]);

  useEffect(() => {
    if (!chart) {
      return;
    }

    return () => {
      existingKeys.current.forEach((id) => {
        chart.removeOverlay({ id });
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      existingKeys.current.clear();
    };
  }, [chart, timeframe]);

  return null;
}
