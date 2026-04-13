import { registerIndicator } from "klinecharts";

type RelativeMovingAverageValue = {
  rma: number;
};

export class RelativeMovingAverage {
  private k: number;
  private current: number = 0;
  private isNew: boolean = true;

  constructor(period: number) {
    this.k = 1 / period;
  }

  next(input: number): number {
    if (this.isNew) {
      this.isNew = false;
      this.current = input;
    } else {
      this.current = this.k * input + (1.0 - this.k) * this.current;
    }
    return this.current;
  }
}

registerIndicator<RelativeMovingAverageValue, number>({
  name: "RMA",
  calcParams: [14],
  precision: 12,
  figures: [{ key: "rma", title: "RMA: ", type: "line" }],
  calc: (kLineDataList, indicator) => {
    const [period] = indicator.calcParams;
    const nextRMA = new RelativeMovingAverage(period);

    return kLineDataList.map((kLineData) => ({
      rma: nextRMA.next(kLineData.close),
    }));
  },
});
