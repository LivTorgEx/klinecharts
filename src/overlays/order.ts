import { registerOverlay } from "klinecharts";
import { formatBigNumber } from "../utils/number";
import { PositionOrder } from "../types/client/order";

type ExtendData = Pick<
  PositionOrder,
  "order_type" | "qty" | "id" | "price" | "client_id" | "original_id"
> & {
  pnl?: number;
};

registerOverlay<ExtendData>({
  name: "order",
  totalStep: 2,
  lock: false,
  zLevel: 40,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  onPressedMoveEnd: ({ overlay }) => {
    const points = overlay.points;
    if (points && points[0]) {
      const newPrice = points[0].value;
      const event = new CustomEvent("manual-order-dragged", {
        detail: {
          orderId:
            overlay.extendData.client_id ??
            overlay.extendData.original_id ??
            overlay.extendData.id,
          oldPrice: overlay.extendData.price,
          newPrice: newPrice,
        },
      });
      window.dispatchEvent(event);
    }
    return true;
  },

  onClick: ({ overlay, figure }) => {
    if (
      figure &&
      (figure.attrs as Record<string, unknown>).role === "delete-button"
    ) {
      const orderId =
        overlay.extendData.client_id ??
        overlay.extendData.original_id ??
        overlay.extendData.id;
      const event = new CustomEvent("manual-order-delete", {
        detail: { orderId },
      });
      window.dispatchEvent(event);
    }
    return true;
  },

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    const order = overlay.extendData;
    const orderType =
      order.order_type[0] +
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
          orderId:
            overlay.extendData.client_id ??
            overlay.extendData.original_id ??
            overlay.extendData.id,
        },
      },
    ];
  },
});
