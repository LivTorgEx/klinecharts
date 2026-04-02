import { registerOverlay } from "klinecharts";
import { toMeasurePrice } from "../../utils/number";

type ExtendData = {
  messages?: string[];
};

registerOverlay<ExtendData>({
  name: "measure",
  totalStep: 3,
  needDefaultPointFigure: true,
  createPointFigures({ coordinates, yAxis, chart, overlay }) {
    if (coordinates.length !== 2 || !yAxis) {
      return [];
    }

    const decimalFoldThreshold = chart.getDecimalFold().threshold;
    const messages = overlay.extendData?.messages;
    const startPrice = yAxis.convertFromPixel(coordinates[0].y);
    const finishPrice = yAxis.convertFromPixel(coordinates[1].y);
    const isShort = startPrice > finishPrice;
    const color = isShort ? "rgba(255,82,82,0.2)" : "rgba(33,150,243,0.2)";
    const priceDiff = finishPrice - startPrice;
    const priceMeasure = toMeasurePrice(startPrice, finishPrice);
    const isBack = coordinates[1].x < coordinates[0].x;

    const blocks = [
      {
        type: "rect",
        styles: {
          color,
        },
        attrs: {
          x: isBack ? coordinates[1].x : coordinates[0].x,
          y: isShort ? coordinates[0].y : coordinates[1].y,
          width: Math.abs(coordinates[1].x - coordinates[0].x),
          height: Math.abs(coordinates[1].y - coordinates[0].y),
        },
      },
      {
        type: "text",
        lock: true,
        styles: {
          backgroundColor: isShort
            ? "rgba(255,82,82,0.6)"
            : "rgba(33,150,243,0.6)",
        },
        attrs: {
          x: (coordinates[0].x + coordinates[1].x) / 2,
          y: coordinates[1].y,
          baseline: isShort ? "top" : "bottom",
          align: "center",
          text: `${priceDiff.toFixed(decimalFoldThreshold)} (${priceMeasure.toFixed(2)}%)`,
        },
      },
    ];

    if (messages) {
      messages.forEach((message, idx) => {
        blocks.push({
          type: "text",
          lock: true,
          styles: {
            backgroundColor: "transparent",
          },
          attrs: {
            x: (coordinates[0].x + coordinates[1].x) / 2,
            y: coordinates[1].y + (isShort ? 1 : -1) * 20 * (idx + 1),
            baseline: isShort ? "top" : "bottom",
            align: "center",
            text: message,
          },
        });
      });
    }

    return blocks;
  },
});
