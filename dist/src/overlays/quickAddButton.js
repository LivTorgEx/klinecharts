import { registerOverlay } from "klinecharts";
registerOverlay({
    name: "quickAddButton",
    totalStep: 1,
    lock: false,
    zLevel: 45,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates, bounding, overlay }) => {
        var _a;
        const buttonSize = 20;
        const buttonX = bounding.width - 24; // Right side
        const buttonY = coordinates[0].y;
        const isBuy = (_a = overlay.extendData.isBuy) !== null && _a !== void 0 ? _a : true;
        const buttonColor = isBuy ? "#22c55e" : "#ef4444"; // Green / Red
        const borderColor = isBuy ? "#16a34a" : "#dc2626"; // Darker border
        return [
            // Button border
            {
                type: "rect",
                zLevel: 44,
                styles: {
                    style: "stroke",
                    color: borderColor,
                    borderSize: 2,
                },
                attrs: {
                    x: buttonX - buttonSize / 2,
                    y: buttonY - buttonSize / 2,
                    width: buttonSize,
                    height: buttonSize,
                },
            },
            // Button background square
            {
                type: "rect",
                zLevel: 45,
                styles: {
                    style: "fill",
                    color: buttonColor,
                },
                attrs: {
                    x: buttonX - buttonSize / 2,
                    y: buttonY - buttonSize / 2,
                    width: buttonSize,
                    height: buttonSize,
                },
            },
            // "+" symbol
            {
                type: "text",
                zLevel: 46,
                ignoreEvent: false,
                styles: {
                    color: "#ffffff",
                    size: 18,
                    weight: "bold",
                    backgroundColor: "transparent",
                },
                attrs: {
                    x: buttonX,
                    y: buttonY,
                    text: "+",
                    align: "center",
                    baseline: "middle",
                },
            },
        ];
    },
});
