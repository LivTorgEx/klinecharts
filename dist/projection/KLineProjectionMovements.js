import { useCallback, useContext, useEffect, useRef } from "react";
import { useChart } from "../context/chart";
import { ClientWebSocketContext } from "../context/clientWebSocketContext";
import { WebsocketEventName, } from "../types/client/websocket";
import { toMeasurePrice } from "../utils/number";
import { useChartSettings } from "../context/chartSettings";
function updateMovs(mov, acc) {
    if (acc.length === 0) {
        acc.push(mov);
        return;
    }
    const lastMov = acc[acc.length - 1];
    if (lastMov.status != mov.status &&
        ["RollbackUp", "RollbackDown"].includes(lastMov.status)) {
        acc.pop();
    }
    if (lastMov.status == mov.status) {
        acc.pop();
        acc.push(mov);
        return;
    }
    const existingIndex = acc.findIndex((m) => m.status === mov.status && m.time_start === mov.time_start);
    if (existingIndex !== -1) {
        acc.splice(existingIndex, 1);
    }
    acc.push(mov);
    if (acc.length > 5) {
        acc.shift();
    }
}
export function KLineProjectionMovements({ tokenName }) {
    const chart = useChart();
    const { timeframe } = useChartSettings();
    const ws = useContext(ClientWebSocketContext);
    const overlayKeys = useRef(new Set());
    const movs = useRef([]);
    const handleUpdateProjection = useCallback((event) => {
        if (event.symbol !== tokenName || !chart) {
            return;
        }
        const movement = event.movements?.[timeframe];
        if (!movement) {
            return;
        }
        if (movement) {
            updateMovs(movement, movs.current);
        }
        const removeSet = new Set(overlayKeys.current);
        movs.current.forEach((mov) => {
            const id = `movmenet_${mov.time_start}`;
            const idBreakLine = `movmenet_${mov.time_start}_break`;
            const priceEnd = mov.direction === "SHORT" ? mov.price_min : mov.price_max;
            const activePrc = toMeasurePrice(mov.activate_price, priceEnd);
            const activateChanges = mov.activate_price_changes
                .map((v) => `${v.toFixed(2)}%`)
                .join("|");
            const rollbackChanges = mov.rollback_price_changes
                .map((v) => `${v.toFixed(2)}%`)
                .join("|");
            const messages = [
                `${mov.status} ${mov.qtym.toFixed(2)}%`,
                `${mov.reason}|${mov.rollbacks}`,
                `Activate: ${activePrc.toFixed(2)}% :: ${activateChanges}`,
                `Rollback: ${rollbackChanges}`,
            ];
            const points = [
                {
                    timestamp: mov.time_start,
                    value: mov.direction === "LONG" ? mov.price_min : mov.price_max,
                },
                {
                    timestamp: mov.time_end,
                    value: mov.direction === "LONG" ? mov.price_max : mov.price_min,
                },
            ];
            const pointBreakLine = mov.break_price
                ? [
                    {
                        timestamp: mov.time_start,
                        value: mov.break_price,
                    },
                    {
                        timestamp: mov.time_end,
                        value: mov.break_price,
                    },
                ]
                : undefined;
            if (chart.getOverlays({ id }).length) {
                chart.overrideOverlay({ id, points, extendData: { messages } });
            }
            else {
                chart.createOverlay({
                    name: "measure",
                    id,
                    lock: true,
                    extendData: { messages },
                    points,
                });
            }
            if (pointBreakLine) {
                if (chart.getOverlays({ id: idBreakLine }).length) {
                    chart.overrideOverlay({ id: idBreakLine, points: pointBreakLine });
                }
                else {
                    chart.createOverlay({
                        name: "movBreakLine",
                        id: idBreakLine,
                        lock: true,
                        points: pointBreakLine,
                    });
                }
                overlayKeys.current.add(idBreakLine);
                removeSet.delete(idBreakLine);
            }
            overlayKeys.current.add(id);
            removeSet.delete(id);
        });
        removeSet.forEach((id) => {
            chart.removeOverlay({ id });
        });
    }, [chart, tokenName, timeframe]);
    useEffect(() => {
        movs.current = [];
    }, [timeframe]);
    useEffect(() => {
        movs.current = [];
        if (!chart) {
            return;
        }
        ws.subscribe(WebsocketEventName.Projection, handleUpdateProjection);
        ws.sendSubscribe({ event: "Projection", symbol: tokenName });
        return () => {
            ws.unsubscribe(WebsocketEventName.Projection, handleUpdateProjection);
            ws.sendUnSubscribe({ event: "Projection", symbol: tokenName });
            // eslint-disable-next-line react-hooks/exhaustive-deps
            overlayKeys.current.forEach((id) => {
                chart.removeOverlay({ id });
            });
        };
    }, [ws, chart, tokenName, handleUpdateProjection]);
    return null;
}
