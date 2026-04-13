import { registerIndicator } from "klinecharts";

import { Accumulator } from "./accumulator";

type SimpleMovingAverageOutput = {
  sma: number;
};

export class SimpleMovingAverage {
  private acc: Accumulator;

  constructor(private period: number) {
    this.acc = new Accumulator(period);
  }

  next(input: number): number {
    const acc = this.acc.next(input);

    return acc / this.period;
  }
}

registerIndicator<SimpleMovingAverageOutput, number>({
  name: "LTE_SMA",
  shortName: "SMA",
  calcParams: [9],
  precision: 12,
  figures: [{ key: "sma", title: "SMA: ", type: "line" }],
  calc: (kLineDataList, indicator) => {
    const [periodK] = indicator.calcParams;
    const nextSMA = new SimpleMovingAverage(periodK);

    return kLineDataList.map(
      (kLineData): SimpleMovingAverageOutput => ({
        sma: nextSMA.next(kLineData.close),
      })
    );
  },
});
