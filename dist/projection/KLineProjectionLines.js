import { useEffect, useRef } from "react";
import { useChart } from "../context/chart";
import { useTradeIndicator } from "../../hooks/api/tradeIndicator";
export function KLineProjectionLines({ symbolId, timeframe }) {
    const chart = useChart();
    const { data: indicator } = useTradeIndicator({
        symbol_id: symbolId,
        timeframe,
    });
    const overlayKeys = useRef(new Set());
    useEffect(() => {
        if (!indicator || !chart || !indicator.indicators.window) {
            return;
        }
        const { window } = indicator.indicators;
        const data = [];
        [
            [
                "Buy",
                {
                    price: window.BuyPrice,
                    klines: window.BuyKLines,
                    direction: window.BuyDirection,
                    crosses: window.BuyCross,
                    qtym: window.BQM,
                },
            ],
            [
                "Sell",
                {
                    price: window.SellPrice,
                    klines: window.SellKLines,
                    direction: window.SellDirection,
                    crosses: window.SellCross,
                    qtym: window.SQM,
                },
            ],
            [
                "Cross",
                {
                    price: window.CrossPrice,
                    klines: window.CrossKLines,
                    direction: window.CrossDirection,
                    crosses: window.CrossTimes,
                    qtym: window.CQM,
                },
            ],
        ].forEach(([name, line]) => {
            if (!line.price || !line.klines) {
                return;
            }
            data.push({
                name: "srLine",
                data: {
                    message: [
                        `${name}[${line.direction}|${line.crosses}${line.qtym ? `|${line.qtym.toFixed(2)}` : ""}]`,
                    ].join(" "),
                    type: name,
                },
                price: line.price,
                points: [
                    {
                        timestamp: +new Date() - line.klines * timeframe * 1000,
                        value: line.price,
                    },
                    { timestamp: +new Date(), value: line.price },
                ],
            });
        });
        const removeSet = new Set(overlayKeys.current);
        data.forEach((line) => {
            const id = `projection_${line.name}_${line.price}`;
            const extendData = line.data;
            if (chart.getOverlays({ id }).length) {
                chart.overrideOverlay({ id, points: line.points, extendData });
            }
            else {
                chart.createOverlay({
                    name: line.name,
                    id,
                    lock: true,
                    points: line.points,
                    extendData,
                });
            }
            overlayKeys.current.add(id);
            removeSet.delete(id);
        });
        removeSet.forEach((id) => {
            chart.removeOverlay({ id });
        });
    }, [indicator, chart, timeframe]);
    useEffect(() => {
        if (!chart) {
            return;
        }
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            overlayKeys.current.forEach((id) => {
                chart.removeOverlay({ id });
            });
        };
    }, [chart]);
    return null;
}
