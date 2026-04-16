import { registerOverlay } from "klinecharts";
registerOverlay({
    name: "srLine",
    totalStep: 2,
    lock: true,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding, overlay }) => {
        const { message = "", type } = overlay.extendData;
        return [
            {
                type: "line",
                styles: {
                    style: type === "Buy" || type === "Sell" ? "solid" : "dashed",
                },
                attrs: { coordinates },
            },
            {
                type: "text",
                ignoreEvent: true,
                styles: {
                    backgroundColor: "none",
                    borderColor: "red",
                },
                attrs: {
                    x: coordinates[1].x + bounding.width * 0.02,
                    y: coordinates[1].y,
                    text: message,
                    baseline: "center",
                },
            },
        ];
    },
});
