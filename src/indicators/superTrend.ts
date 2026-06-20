import { KLineData, registerIndicator } from "klinecharts";
import { AverageTrueRange } from "./averageTrueRange";
import { PositionDirection } from "../types/client/direction";

type SuperTrendValue = {
  buy?: number;
  sell?: number;
};

export class SuperTrend {
  private atr: AverageTrueRange;
  private superTrend?: number;
  private direction: PositionDirection = PositionDirection.BOTH;

  constructor(
    period: number,
    private multiplier: number
  ) {
    this.atr = new AverageTrueRange(period);
  }

  next(input: KLineData): number {
    // Calculate the ATR value for the current data item.
    const atrValue = this.atr.next(input);

    // Calculate the upper and lower bands.
    const midLine = (input.high + input.low) / 2;
    const upperBand = midLine + this.multiplier * atrValue;
    const lowerBand = midLine - this.multiplier * atrValue;

    // Determine the Supertrend value.
    if (this.superTrend === undefined) {
      this.superTrend = lowerBand;
      this.direction = PositionDirection.LONG;
    } else if (input.close > this.superTrend) {
      if (this.direction === PositionDirection.LONG) {
        this.superTrend = Math.max(lowerBand, this.superTrend);
      } else {
        this.direction = PositionDirection.LONG;
        this.superTrend = lowerBand;
      }
    } else {
      if (this.direction === PositionDirection.SHORT) {
        this.superTrend = Math.min(upperBand, this.superTrend);
      } else {
        this.direction = PositionDirection.SHORT;
        this.superTrend = upperBand;
      }
    }

    // Return the current Supertrend value.
    return this.superTrend!;
  }
}

registerIndicator<SuperTrendValue, number>({
  name: "SuperTrend",
  calcParams: [10, 3],
  precision: 12,
  calc: (kLineDataList, indicator) => {
    const [period, multiplier] = indicator.calcParams;
    const superTrend = new SuperTrend(period, multiplier);

    return kLineDataList.map((kLineData): SuperTrendValue => {
      const value = superTrend.next(kLineData);

      return {
        buy: kLineData.close > value ? value : undefined,
        sell: kLineData.close < value ? value : undefined,
      };
    });
  },
  draw: ({ ctx, indicator, chart, xAxis, yAxis }) => {
    const { from, to } = chart.getVisibleRange();
    const kLineDataList = chart.getDataList();
    const result = indicator.result;
    let initialSide: PositionDirection = PositionDirection.BOTH;

    for (let i = from; i < to; i++) {
      const data = result[i];
      if (!data) {
        continue;
      }
      const kLineData = kLineDataList[i];
      const x = xAxis.convertToPixel(i);

      if (data.buy !== undefined) {
        const dataY = yAxis.convertToPixel(data.buy);
        if (initialSide !== PositionDirection.LONG) {
          const y = yAxis.convertToPixel(kLineData.low);
          ctx.stroke();
          ctx.closePath();
          ctx.fillStyle = "green";
          ctx.fillText("Buy", x - 6, y + 4);
          initialSide = PositionDirection.LONG;
          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.strokeStyle = "green";
          ctx.moveTo(x, dataY);
        } else {
          ctx.lineTo(x, dataY);
        }
      } else if (data.sell !== undefined) {
        const dataY = yAxis.convertToPixel(data.sell);
        if (initialSide !== PositionDirection.SHORT) {
          const y = yAxis.convertToPixel(kLineData.high);
          ctx.stroke();
          ctx.closePath();
          ctx.fillStyle = "red";
          ctx.fillText("Sell", x - 8, y - 12);
          initialSide = PositionDirection.SHORT;
          ctx.beginPath();
          ctx.strokeStyle = "red";
          ctx.setLineDash([]);
          ctx.moveTo(x, dataY);
        } else {
          ctx.lineTo(x, dataY);
        }
      }
    }

    ctx.stroke();
    ctx.closePath();
    return false;
  },
});
