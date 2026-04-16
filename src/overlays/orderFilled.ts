import { registerOverlay } from "klinecharts";
import { green, red } from "@mui/material/colors";

import { formatBigNumber } from "../utils/number";
import { PositionOrder } from "../types/client/order";
import { isTruthy } from "../utils/filter";
import { formatServerDate } from "../utils/date";

type ExtendData = PositionOrder & {
  timestamp?: number;
  timeframe?: number;
  showOrder?: boolean;
  showNotes?: boolean;
};

registerOverlay<ExtendData>({
  name: "orderFilled",
  totalStep: 2,
  lock: true,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  onSelected: ({ overlay }) => {
    overlay.extendData.showNotes = true;
    return true;
  },
  onDeselected: ({ overlay }) => {
    overlay.extendData.showNotes = false;
    return true;
  },
  onMouseEnter: ({ overlay }) => {
    overlay.extendData.showOrder = true;
    return true;
  },
  onMouseLeave: ({ overlay }) => {
    overlay.extendData.showOrder = false;

    return true;
  },
  createPointFigures: ({ coordinates, overlay, chart }) => {
    const barSpace = chart.getBarSpace();
    const order = overlay.extendData;
    const side = order.qty > 0 ? "Buy" : "Sell";
    const price = order.price || order.stop_price;
    let x = coordinates[0].x;
    if (order.timeframe && order.timestamp) {
      const tf = order.timeframe * 1000;
      const diff = ((order.timestamp % tf) - tf / 2) / tf;
      x += diff * barSpace.bar;
    }

    return [
      {
        type: "polygon",
        styles: {
          style: "stroke_fill",
          color: order.qty > 0 ? green[800] : red[500],
        },
        zLevel: 10,
        attrs: {
          coordinates:
            order.qty > 0
              ? [
                  { x, y: coordinates[0].y },
                  { x: x - 10, y: coordinates[0].y + 14 },
                  { x: x + 10, y: coordinates[0].y + 14 },
                ]
              : [
                  { x, y: coordinates[0].y },
                  { x: x - 10, y: coordinates[0].y - 14 },
                  { x: x + 10, y: coordinates[0].y - 14 },
                ],
        },
      },
      order.showOrder && {
        type: "text",
        ignoreEvent: true,
        zLevel: 30,
        styles: {
          backgroundColor: order.qty > 0 ? green[600] : red[500],
        },
        attrs: [
          {
            x,
            y: order.qty > 0 ? coordinates[0].y + 30 : coordinates[0].y - 30,
            text: `${side} ${formatBigNumber(order.qty, "")} @ ${price}`,
            baseline: "center",
            align: "center",
          },
        ],
      },
      order.showNotes && {
        type: "text",
        ignoreEvent: true,
        zLevel: 30,
        attrs: [
          order.update_at ? `Time: ${formatServerDate(order.update_at)}` : "",
          `${order.order_type}`,
          order.notes?.map((n) => JSON.stringify(n)).join(" | "),
          `QTY: ${order.qty} Amount: ${order.qty * order.price}$`,
          // order.original_id ? `#ID ${order.original_id}` : undefined,
        ]
          .filter(isTruthy)
          .map((text, idx) => ({
            x,
            y:
              order.qty > 0
                ? coordinates[0].y + 30 + 21 * idx
                : coordinates[0].y - 30 - 21 * idx,
            text,
            baseline: "center",
            align: "center",
          })),
      },
    ].filter(isTruthy);
  },
});
