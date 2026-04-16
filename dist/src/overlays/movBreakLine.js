import { registerOverlay } from "klinecharts";
registerOverlay({
    name: "movBreakLine",
    totalStep: 2,
    lock: true,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
        return [
            {
                type: "line",
                styles: {
                    style: "solid",
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
                    x: coordinates[1].x,
                    y: coordinates[1].y,
                    text: "BreakMove",
                    baseline: "center",
                },
            },
        ];
    },
});
