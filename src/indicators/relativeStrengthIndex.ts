import { KLineData, registerIndicator } from "klinecharts";
import { RelativeMovingAverage } from "./relativeMovingAverage";

type RelativeStrengthIndexValue = {
  rsi: number;
};

export class RelativeStrengthIndex {
  private up: RelativeMovingAverage;
  private down: RelativeMovingAverage;
  private prevValue?: number;

  constructor(period: number) {
    this.up = new RelativeMovingAverage(period);
    this.down = new RelativeMovingAverage(period);
  }

  next(input: KLineData): number {
    let change = 0;
    if (this.prevValue === undefined) {
      this.prevValue = input.close;
    } else {
      change = input.close - this.prevValue;
    }

    const up = this.up.next(Math.max(change, 0));
    const down = this.down.next(-Math.min(change, 0));

    this.prevValue = input.close;
    return (100.0 * up) / (up + down);
  }
}

registerIndicator<RelativeStrengthIndexValue, number>({
  name: "LTE_RSI",
  shortName: "RSI",
  calcParams: [14],
  minValue: 0,
  maxValue: 100,
  precision: 2,
  figures: [{ key: "rsi", title: "RSI: ", type: "line" }],
  calc: (kLineDataList, indicator) => {
    const [period] = indicator.calcParams;
    const nextRSI = new RelativeStrengthIndex(period);

    return kLineDataList.map((kLineData) => ({
      rsi: nextRSI.next(kLineData),
    }));
  },
});
