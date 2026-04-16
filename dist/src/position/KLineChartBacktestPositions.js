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
            var _a, _b;
            const posId = `position_${position.id}`;
            const firstOrder = position.orders[0];
            const lastOrder = position.orders[position.orders.length - 1];
            if (firstOrder) {
                const points = [
                    {
                        timestamp: +parseServerDate((_a = firstOrder.update_at) !== null && _a !== void 0 ? _a : ""),
                        value: firstOrder.price,
                    },
                ];
                if (lastOrder) {
                    points.push({
                        timestamp: +parseServerDate((_b = lastOrder.update_at) !== null && _b !== void 0 ? _b : ""),
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
                var _a;
                const timestamp = +parseServerDate((_a = order.update_at) !== null && _a !== void 0 ? _a : "");
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
