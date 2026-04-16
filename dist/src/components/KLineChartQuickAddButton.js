import { useEffect, useRef, useState } from "react";
import { useChart } from "../context/chart";
const computeViewportPosition = (chart, event) => {
    if (!event)
        return undefined;
    if (typeof event.pageX === "number" && typeof event.pageY === "number") {
        return {
            x: event.pageX - window.scrollX,
            y: event.pageY - window.scrollY,
        };
    }
    if (typeof event.x === "number" && typeof event.y === "number" && chart) {
        const dom = chart.getDom();
        if (dom) {
            const rect = dom.getBoundingClientRect();
            return { x: rect.left + event.x, y: rect.top + event.y };
        }
    }
    return undefined;
};
export function KLineChartQuickAddButton({ onQuickAdd }) {
    const chart = useChart();
    const [hoverPrice, setHoverPrice] = useState(null);
    const overlayIdRef = useRef("quickAddButton_hover");
    const touchTimeoutRef = useRef(null);
    const touchModeRef = useRef(false);
    useEffect(() => {
        if (!chart)
            return;
        const container = chart.getDom();
        const getYFromClient = (clientY) => {
            if (!container)
                return null;
            const rect = container.getBoundingClientRect();
            return clientY - rect.top;
        };
        const handlePointerMove = (clientY) => {
            var _a;
            if (clientY === null) {
                setHoverPrice(null);
                return;
            }
            const y = clientY;
            const result = chart.convertFromPixel([{ x: 0, y }], {
                paneId: "candle_pane",
            });
            if (result && Array.isArray(result) && ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.value)) {
                setHoverPrice(result[0].value);
            }
            else {
                setHoverPrice(null);
            }
        };
        const handleMouseMove = (event) => {
            const y = getYFromClient(event.clientY);
            handlePointerMove(y);
        };
        const handlePointerMoveEvent = (event) => {
            const y = getYFromClient(event.clientY);
            handlePointerMove(y);
        };
        const handleTouchMove = (event) => {
            touchModeRef.current = true;
            if (touchTimeoutRef.current) {
                window.clearTimeout(touchTimeoutRef.current);
                touchTimeoutRef.current = null;
            }
            const touch = event.touches && event.touches[0];
            if (!touch) {
                setHoverPrice(null);
                return;
            }
            const y = getYFromClient(touch.clientY);
            handlePointerMove(y);
        };
        const handleTouchStart = (event) => {
            touchModeRef.current = true;
            if (touchTimeoutRef.current) {
                window.clearTimeout(touchTimeoutRef.current);
                touchTimeoutRef.current = null;
            }
            const touch = event.touches && event.touches[0];
            if (!touch)
                return;
            const y = getYFromClient(touch.clientY);
            handlePointerMove(y);
        };
        const handleTouchEnd = () => {
            // keep overlay visible for a short time so user can tap the '+' button
            if (touchTimeoutRef.current)
                window.clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = window.setTimeout(() => {
                touchModeRef.current = false;
                setHoverPrice(null);
                touchTimeoutRef.current = null;
            }, 1500);
        };
        const handleMouseLeave = () => {
            // only clear immediately if not in touch mode
            if (touchModeRef.current)
                return;
            setHoverPrice(null);
        };
        if (container) {
            container.addEventListener("mousemove", handleMouseMove);
            container.addEventListener("pointermove", handlePointerMoveEvent);
            container.addEventListener("touchmove", handleTouchMove, {
                passive: true,
            });
            container.addEventListener("touchstart", handleTouchStart, {
                passive: true,
            });
            container.addEventListener("touchend", handleTouchEnd);
            container.addEventListener("mouseleave", handleMouseLeave);
            container.addEventListener("pointerleave", handleMouseLeave);
        }
        const overlayId = overlayIdRef.current;
        return () => {
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove);
                container.removeEventListener("pointermove", handlePointerMoveEvent);
                container.removeEventListener("touchmove", handleTouchMove);
                container.removeEventListener("touchstart", handleTouchStart);
                container.removeEventListener("touchend", handleTouchEnd);
                container.removeEventListener("mouseleave", handleMouseLeave);
                container.removeEventListener("pointerleave", handleMouseLeave);
            }
            if (touchTimeoutRef.current) {
                window.clearTimeout(touchTimeoutRef.current);
                touchTimeoutRef.current = null;
            }
            // Clean up overlay
            chart.removeOverlay({ id: overlayId });
        };
    }, [chart, hoverPrice, onQuickAdd]);
    useEffect(() => {
        if (!chart || !hoverPrice) {
            // Remove overlay when not hovering
            chart === null || chart === void 0 ? void 0 : chart.removeOverlay({ id: overlayIdRef.current });
            return;
        }
        // Get the current visible range to use a valid timestamp
        const dataList = chart.getDataList();
        if (!dataList || dataList.length === 0)
            return;
        // Use the last candle's timestamp and close price
        const last = dataList[dataList.length - 1];
        const lastTimestamp = last.timestamp;
        const lastClose = last.close;
        // Create or update the quick-add button overlay at hover price
        const overlayExists = chart.getOverlays({ id: overlayIdRef.current }).length > 0;
        const points = [{ timestamp: lastTimestamp, value: hoverPrice }];
        const isBuy = lastClose ? hoverPrice < lastClose : true;
        if (overlayExists) {
            chart.overrideOverlay({
                id: overlayIdRef.current,
                points,
                extendData: {
                    price: hoverPrice,
                    isBuy,
                },
                onClick: (event) => {
                    onQuickAdd(hoverPrice, isBuy, computeViewportPosition(chart, event));
                },
            });
        }
        else {
            chart.createOverlay({
                name: "quickAddButton",
                id: overlayIdRef.current,
                points,
                lock: false,
                extendData: {
                    price: hoverPrice,
                    isBuy: lastClose ? hoverPrice < lastClose : true,
                },
                onClick: (event) => {
                    onQuickAdd(hoverPrice, isBuy, computeViewportPosition(chart, event));
                },
            });
        }
    }, [chart, hoverPrice, onQuickAdd]);
    return null;
}
