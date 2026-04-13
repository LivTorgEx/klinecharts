import { registerOverlay } from "klinecharts";

import { isTruthy } from "../../utils/filter";

type ExtendData = {
  showSignal?: boolean;
  message: string;
};

registerOverlay<ExtendData>({
  name: "debugSignal",
  totalStep: 2,
  lock: true,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  onMouseEnter: ({ overlay }) => {
    overlay.extendData.showSignal = true;
    return true;
  },
  onMouseLeave: ({ overlay }) => {
    overlay.extendData.showSignal = false;

    return true;
  },
  createPointFigures: ({ coordinates, overlay }) => {
    const data = overlay.extendData;
    return [
      {
        type: "polygon",
        zLevel: 10,
        attrs: {
          coordinates: [
            [5, 0],
            [8, 4],
            [10, 4],
            [7, 7],
            [9, 10],
            [5, 8],
            [1, 10],
            [3, 7],
            [0, 4],
            [2, 4],
          ].map(([x, y]) => ({
            x: coordinates[0].x + (x - 5) * 2,
            y: coordinates[0].y + (y - 5) * 2,
          })),
        },
      },
      data.showSignal && {
        type: "text",
        ignoreEvent: true,
        zLevel: 30,
        attrs: [
          {
            x: coordinates[0].x,
            y: coordinates[0].y + 30,
            text: data.message,
            baseline: "center",
            align: "center",
          },
        ],
      },
    ].filter(isTruthy);
  },
});
