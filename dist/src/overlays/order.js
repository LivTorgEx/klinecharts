import { registerOverlay } from "klinecharts";
import { formatBigNumber } from "../utils/number";
registerOverlay({
    name: "order",
    totalStep: 2,
    lock: false,
    zLevel: 40,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    onPressedMoveEnd: ({ overlay }) => {
        var _a, _b;
        const points = overlay.points;
        if (points && points[0]) {
            const newPrice = points[0].value;
            const event = new CustomEvent("manual-order-dragged", {
                detail: {
                    orderId: (_b = (_a = overlay.extendData.client_id) !== null && _a !== void 0 ? _a : overlay.extendData.original_id) !== null && _b !== void 0 ? _b : overlay.extendData.id,
                    oldPrice: overlay.extendData.price,
                    newPrice: newPrice,
                },
            });
            window.dispatchEvent(event);
        }
        return true;
    },
    onClick: ({ overlay, figure }) => {
        var _a, _b;
        if (figure &&
            figure.attrs.role === "delete-button") {
            const orderId = (_b = (_a = overlay.extendData.client_id) !== null && _a !== void 0 ? _a : overlay.extendData.original_id) !== null && _b !== void 0 ? _b : overlay.extendData.id;
            const event = new CustomEvent("manual-order-delete", {
                detail: { orderId },
            });
            window.dispatchEvent(event);
        }
        return true;
    },
    createPointFigures: ({ coordinates, bounding, overlay }) => {
        var _a, _b;
        const order = overlay.extendData;
        const orderType = order.order_type[0] +
            order.order_type.slice(1).toLowerCase().replaceAll("_", " ");
        const parts = [];
        if (order.qty) {
            parts.push(formatBigNumber(order.qty, ""));
        }
        if (order.pnl) {
            parts.push(formatBigNumber(order.pnl, "$"));
        }
        parts.push(orderType);
        const btnFill = order.qty < 0 ? "#991b1b" : "#15803d";
        return [
            // Main price line
            {
                type: "line",
                zLevel: 40,
                styles: {
                    color: order.qty < 0 ? "#991b1b" : "#15803d",
                },
                attrs: {
                    coordinates: [
                        { x: bounding.width * 0.2, y: coordinates[0].y },
                        { x: bounding.width, y: coordinates[0].y },
                    ],
                },
            },
            // Order info text
            {
                type: "text",
                zLevel: 40,
                ignoreEvent: true,
                styles: {
                    backgroundColor: order.qty < 0 ? "#991b1b" : "#15803d",
                },
                attrs: {
                    x: bounding.width * 0.2,
                    y: coordinates[0].y,
                    text: parts.join(" | "),
                    baseline: "center",
                },
            },
            // cross text
            {
                type: "text",
                zLevel: 52,
                ignoreEvent: false,
                styles: {
                    color: "#ffffff",
                    size: 14,
                    weight: "bold",
                    backgroundColor: btnFill,
                },
                attrs: {
                    x: bounding.width * 0.2 - 12,
                    y: coordinates[0].y,
                    width: 18,
                    height: 22,
                    text: "✖",
                    align: "center",
                    baseline: "middle",
                    role: "delete-button",
                    orderId: (_b = (_a = overlay.extendData.client_id) !== null && _a !== void 0 ? _a : overlay.extendData.original_id) !== null && _b !== void 0 ? _b : overlay.extendData.id,
                },
            },
        ];
    },
});
