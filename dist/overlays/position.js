import { registerOverlay } from "klinecharts";
import { formatBigNumber } from "../../utils/number";
registerOverlay({
    name: "position",
    totalStep: 2,
    zLevel: 50,
    lock: false,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding, overlay, chart }) => {
        const defaultStyles = chart.getStyles().overlay;
        const position = overlay.extendData;
        const realizedProfit = position.totalProfit - position.fee;
        return [
            {
                type: "line",
                zLevel: 50,
                attrs: {
                    coordinates: [
                        { x: bounding.width * 0.2, y: coordinates[0].y },
                        { x: bounding.width, y: coordinates[0].y },
                    ],
                },
            },
            {
                type: "text",
                zLevel: 50,
                ignoreEvent: true,
                styles: {
                    backgroundColor: position.qty < 0 ? "#ff0000" : defaultStyles.text.backgroundColor,
                },
                attrs: {
                    x: bounding.width * 0.2,
                    y: coordinates[0].y,
                    text: `${position.qty} | ${formatBigNumber(realizedProfit)} + ${formatBigNumber(position.pnl)} = ${formatBigNumber(realizedProfit + position.pnl)}`,
                    baseline: "center",
                },
            },
        ];
    },
});
