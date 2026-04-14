import { registerOverlay } from "klinecharts";
import { formatBigNumber } from "../utils/number";
import { SuggestionInfoOrderBookLevel } from "../types/client/suggestion";

registerOverlay<SuggestionInfoOrderBookLevel>({
  name: "orderBookLine",
  totalStep: 2,
  lock: true,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    const level = overlay.extendData;
    const amount = formatBigNumber(level.price * level.quantity);
    const totalAmount = formatBigNumber(level.total_amount);
    const filled = level.filled && formatBigNumber(level.price * level.filled);

    return [
      {
        type: "line",
        attrs: {
          coordinates: [
            coordinates[0],
            { x: bounding.width, y: coordinates[0].y },
          ],
        },
      },
      {
        type: "text",
        ignoreEvent: true,
        attrs: {
          x: bounding.width,
          y: coordinates[0].y,
          text: `${amount} [${totalAmount}] ${filled ? `(${filled})` : ""}`,
          align: "end",
          baseline: "bottom",
        },
      },
    ];
  },
});
