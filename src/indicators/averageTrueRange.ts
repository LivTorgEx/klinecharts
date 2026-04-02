import { KLineData, registerIndicator } from "klinecharts";
import { TrueRange } from "./trueRange";
import { RelativeMovingAverage } from "./relativeMovingAverage";

type AverageTrueRangeValue = {
  atr: number;
};

export class AverageTrueRange {
  private trueRange: TrueRange;
  private rma: RelativeMovingAverage;

  constructor(period: number) {
    this.trueRange = new TrueRange();
    this.rma = new RelativeMovingAverage(period);
  }

  next(input: number | KLineData): number {
    return this.rma.next(this.trueRange.next(input));
  }
}

registerIndicator<AverageTrueRangeValue, number>({
  name: "ATR",
  calcParams: [10],
  precision: 12,
  figures: [{ key: "atr", title: "Atr: ", type: "line" }],
  calc: (kLineDataList, indicator) => {
    const [period] = indicator.calcParams;
    const nextAtr = new AverageTrueRange(period);

    return kLineDataList.map((kLineData) => ({
      atr: nextAtr.next(kLineData),
    }));
  },
});
