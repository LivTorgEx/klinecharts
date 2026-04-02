import { registerOverlay } from "klinecharts";
import { green, red } from "@mui/material/colors";

import { formatBigNumber } from "../../utils/number";
import { isTruthy } from "../../utils/filter";
import { OrderDirection } from "../../types/client/order";

type ExtendData = {
  side: OrderDirection;
  pnl: number;
  showInfo?: boolean;
};

registerOverlay<ExtendData>({
  name: "positionFilled",
  totalStep: 2,
  lock: true,
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,

  onMouseEnter: ({ overlay }) => {
    overlay.extendData.showInfo = true;

    return true;
  },
  onMouseLeave: ({ overlay }) => {
    overlay.extendData.showInfo = false;

    return true;
  },
  createPointFigures: ({ coordinates, overlay }) => {
    const data = overlay.extendData;
    const side = data.side === OrderDirection.LONG ? "Long" : "Short";
    return [
      {
        type: "circle",
        styles: {
          color: data.pnl > 0 ? green[500] : red[500],
        },
        attrs: [
          {
            x: coordinates[0].x,
            y: coordinates[0].y,
            r: 5,
          },
        ],
      },
      coordinates.length === 2 && {
        type: "line",
        styles: {
          color: data.pnl > 0 ? green[500] : red[500],
          size: 2,
          style: "dashed",
          dashedValue: [2, 2],
        },
        attrs: [{ coordinates }],
      },
      data.showInfo && {
        type: "text",
        ignoreEvent: true,
        zLevel: 30,
        styles: {
          backgroundColor: data.pnl > 0 ? green[500] : red[500],
        },
        attrs: [
          {
            x: coordinates[0].x,
            y: coordinates[0].y - 30,
            text: `${side} ${formatBigNumber(data.pnl)}`,
            baseline: "center",
            align: "center",
          },
        ],
      },
    ].filter(isTruthy);
  },
});
