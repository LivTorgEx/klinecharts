import { registerIndicator } from "klinecharts";
import { AverageTrueRange } from "./averageTrueRange";
import { ExponentialMovingAverage } from "./exponentialMovingAverage";
import { crossover } from "../helper/crossover";

interface UtBotAlert {
  stop: number;
  pos: number;
  buy: boolean;
  sell: boolean;
}

registerIndicator<UtBotAlert, number>({
  name: "ATRTralling",
  calcParams: [1, 10],
  precision: 12,
  calc: (kLineDataList, indicator) => {
    const [atrMultiply, period] = indicator.calcParams;
    const nextAtr = new AverageTrueRange(period);
    const nextEma = new ExponentialMovingAverage(1);
    let currentStop = 0;
    let currentEma = 0;
    let pos = 0;

    return kLineDataList.map((kLineData, idx) => {
      const atr = nextAtr.next(kLineData);
      const nLoss = atrMultiply * atr;
      const src = kLineData.close;
      const prevStop = currentStop;
      const prevEma = currentEma;
      const prevClose = kLineDataList[idx - 1]?.close;

      currentEma = nextEma.next(src);
      if (src > currentStop && kLineDataList[idx - 1]?.close > currentStop) {
        currentStop = Math.max(currentStop, src - nLoss);
      } else if (
        src < currentStop &&
        kLineDataList[idx - 1]?.close < currentStop
      ) {
        currentStop = Math.min(currentStop, src + nLoss);
      } else if (src > currentStop) {
        currentStop = src - nLoss;
      } else {
        currentStop = src + nLoss;
      }

      // Position logic
      if (prevClose === undefined) {
        pos = 0;
      } else if (prevClose < prevStop && src > prevStop) {
        pos = 1; // Buy
      } else if (prevClose > prevStop && src < prevStop) {
        pos = -1; // Sell
      }

      const above = crossover(currentEma, prevEma, currentStop, prevStop);
      const below = crossover(currentStop, prevStop, currentEma, prevEma);

      return {
        stop: currentStop,
        pos,
        buy: src > currentStop && above,
        sell: src < currentStop && below,
      };
    });
  },
  draw: ({ ctx, indicator, xAxis, yAxis, chart }) => {
    const { from, to } = chart.getVisibleRange();
    const kLineDataList = chart.getDataList();

    const result = indicator.result;
    for (let i = from; i < to; i++) {
      const data = result[i];
      if (!data) {
        continue;
      }
      const kLineData = kLineDataList[i];
      const x = xAxis.convertToPixel(i);

      if (data.buy) {
        const y = yAxis.convertToPixel(kLineData.low);
        ctx.fillStyle = "green";
        ctx.fillText("Buy", x - 6, y + 4);
      }
      if (data.sell) {
        const y = yAxis.convertToPixel(kLineData.high);
        ctx.fillStyle = "red";
        ctx.fillText("Sell", x - 8, y - 12);
      }
    }

    return false;
  },
});
