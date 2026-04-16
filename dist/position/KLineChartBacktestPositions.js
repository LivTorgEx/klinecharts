import { useEffect, useRef, useState } from "react";
import { useChart } from "../context/chart";
import { parseServerDate } from "../utils/date";
import { useChartSettings } from "../context/chartSettings";
export function KLineChartBacktestPositions({ positions }) {
    const chart = useChart();
    const { timeframe } = useChartSettings();
    const existingKeys = useRef(new Set());
    const [selectedPosition, setSelectedPosition] = useState(undefined);
    useEffect(() => {
        if (!chart) {
            return;
        }
        const filteredPositions = selectedPosition === undefined
            ? positions
            : positions.filter(({ id }) => id === selectedPosition);
        filteredPositions.forEach((position) => {
            const posId = `position_${position.id}`;
            const firstOrder = position.orders[0];
            const lastOrder = position.orders[position.orders.length - 1];
            if (firstOrder) {
                const points = [
                    {
                        timestamp: +parseServerDate(firstOrder.update_at ?? ""),
                        value: firstOrder.price,
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
                    showInfo: true,
                };
                if (chart.getOverlays({ id: posId }).length) {
                    chart.overrideOverlay({
                        id: posId,
                        points,
                        extendData: posExtendData,
                    });
                }
                else {
                    chart.createOverlay({
                        name: "positionFilled",
                        id: posId,
                        points,
                        extendData: posExtendData,
                        onSelected: () => {
                            setSelectedPosition(position.id);
                            return true;
                        },
                        onDeselected: () => {
                            setSelectedPosition(undefined);
                            return true;
                        },
                    });
                }
                existingKeys.current.add(posId);
            }
            position.orders.forEach((order) => {
                const timestamp = +parseServerDate(order.update_at ?? "");
                const points = [
                    {
                        timestamp,
                        value: order.price || order.stop_price,
                    },
                ];
                const id = `order_${order.id}`;
                if (chart.getOverlays({ id }).length) {
                    chart.overrideOverlay({
                        id,
                        points,
                        extendData: { ...order, timestamp, timeframe },
                    });
                }
                else {
                    chart.createOverlay({
                        name: "orderFilled",
                        id,
                        points,
                        extendData: { ...order, timestamp, timeframe },
                    });
                }
                existingKeys.current.add(id);
            });
        });
    }, [positions, selectedPosition, chart, timeframe]);
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
    }, [chart]);
    return null;
}
