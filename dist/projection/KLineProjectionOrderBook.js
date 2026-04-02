import { useCallback, useContext, useEffect, useRef } from "react";
import { useChart } from "../context/chart";
import { ClientWebSocketContext } from "../../context/clientWebSocketContext";
import { WebsocketEventName, } from "../../types/client/websocket";
export function KLineProjectionOrderBook({ tokenName }) {
    const chart = useChart();
    const ws = useContext(ClientWebSocketContext);
    const overlayKeys = useRef(new Set());
    const handleUpdateProjection = useCallback((event) => {
        if (event.symbol !== tokenName || !chart || !event.order_book) {
            return;
        }
        const removeSet = new Set(overlayKeys.current);
        [
            ...event.order_book.short_levels,
            ...event.order_book.long_levels,
        ].forEach((level) => {
            const points = [
                {
                    timestamp: level.time_start,
                    value: level.price,
                },
            ];
            const id = `orderBookLevel_${level.price}`;
            if (chart.getOverlays({ id }).length) {
                chart.overrideOverlay({ id, points, extendData: level });
            }
            else {
                chart.createOverlay({
                    name: "orderBookLine",
                    id,
                    lock: true,
                    points,
                    extendData: level,
                });
            }
            overlayKeys.current.add(id);
            removeSet.delete(id);
        });
        removeSet.forEach((id) => {
            chart.removeOverlay({ id });
        });
    }, [chart, tokenName]);
    useEffect(() => {
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
