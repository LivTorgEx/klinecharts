import { registerOverlay } from "klinecharts";

import { formatBigNumber } from "../utils/number";

type ExtendData = {
  id: string;
  price: number;
  label: string;
  color?: string;
  isLoading?: boolean;
};

type FigureWithAttrs = {
  attrs?: unknown;
};

function getFigureRole(figure: FigureWithAttrs | undefined) {
  if (
    !figure?.attrs ||
    typeof figure.attrs !== "object" ||
    !("role" in figure.attrs)
  ) {
    return undefined;
  }

  const { role } = figure.attrs;
  return typeof role === "string" ? role : undefined;
}

registerOverlay<ExtendData>({
  name: "alert",
  totalStep: 2,
  lock: false,
  zLevel: 46,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,

  onPressedMoveEnd: ({ overlay }) => {
    if (overlay.extendData.isLoading) {
      return true;
    }

    const point = overlay.points?.[0];
    if (point?.value !== undefined) {
      window.dispatchEvent(
        new CustomEvent("user-alert-dragged", {
          detail: {
            alertId: overlay.extendData.id,
            oldPrice: overlay.extendData.price,
            newPrice: point.value,
          },
        })
      );
    }

    return true;
  },

  onClick: ({ overlay, figure }) => {
    if (overlay.extendData.isLoading) {
      return false;
    }

    if (getFigureRole(figure) === "delete-button") {
      window.dispatchEvent(
        new CustomEvent("user-alert-delete", {
          detail: {
            alertId: overlay.extendData.id,
          },
        })
      );
      return true;
    }

    return false;
  },

  createPointFigures: ({ coordinates, bounding, overlay }) => {
    const { isLoading = false } = overlay.extendData;
    const baseColor = overlay.extendData.color ?? "#ea580c";
    // When loading, dim to ~45% opacity so it reads as "locked/pending"
    const color = isLoading ? `${baseColor}73` : baseColor;
    const priceText = formatBigNumber(overlay.extendData.price, "");
    const label = overlay.extendData.label;
    const text = isLoading
      ? `${label} | ${priceText} …`
      : `${label} | ${priceText}`;

    return [
      {
        type: "line",
        zLevel: 46,
        styles: {
          color,
          style: isLoading ? "dashed" : "solid",
          dashedValue: [6, 3],
        },
        attrs: {
          coordinates: [
            { x: bounding.width * 0.24, y: coordinates[0].y },
            { x: bounding.width, y: coordinates[0].y },
          ],
        },
      },
      {
        type: "text",
        zLevel: 46,
        ignoreEvent: true,
        styles: {
          backgroundColor: color,
          color: "#ffffff",
        },
        attrs: {
          x: bounding.width * 0.24,
          y: coordinates[0].y,
          text,
          baseline: "center",
        },
      },
      {
        type: "text",
        zLevel: 56,
        ignoreEvent: isLoading,
        styles: {
          color: "#ffffff",
          size: 14,
          weight: "bold",
          backgroundColor: color,
        },
        attrs: {
          x: bounding.width * 0.24 - 12,
          y: coordinates[0].y,
          width: 18,
          height: 22,
          text: isLoading ? "⟳" : "✖",
          align: "center",
          baseline: "middle",
          role: "delete-button",
        },
      },
    ];
  },
});
