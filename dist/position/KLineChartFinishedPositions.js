import { useEffect, useRef } from "react";
import { useBotPositions } from "../hooks/api/botPositionHooks";
import { useChart } from "../context/chart";
import { parseServerDate } from "../utils/date";
import { useChartSettings } from "../context/chartSettings";
export function KLineChartFinishedPositions({ botId }) {
    const chart = useChart();
    const { timeframe } = useChartSettings();
    const { data: positions } = useBotPositions({
        bot_id: botId,
        status: ["Completed"],
        order_status: ["Filled"],
    });
    const existingKeys = useRef(new Set());
    useEffect(() => {
        if (!chart) {
            return;
        }
        const removeSet = new Set(existingKeys.current);
        positions?.data?.forEach((position) => {
            const posId = `position_${position.id}`;
            const firstOrder = position.orders[0];
            const lastOrder = position.orders[position.orders.length - 1];
            const points = [
                firstOrder
                    ? {
                        timestamp: +parseServerDate(firstOrder.update_at ?? ""),
                        value: firstOrder.price || lastOrder.stop_price,
                    }
                    : {
                        timestamp: +parseServerDate(position.created_at),
                        value: position.entry_price,
                    },
            ];
            if (lastOrder) {
                points.push({
                    timestamp: +parseServerDate(lastOrder.update_at ?? ""),
                    value: lastOrder.price || lastOrder.stop_price,
                });
            }
            const posExtendData = {
                side: position.side,
                pnl: position.total_profit - position.fee,
            };
            if (chart.getOverlays({ id: posId }).length) {
                chart.overrideOverlay({ id: posId, points, extendData: posExtendData });
            }
            else {
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
                const timestamp = +parseServerDate(order.update_at ?? "");
                const points = [
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
