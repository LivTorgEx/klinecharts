import { KLineData, registerIndicator } from "klinecharts";
import { AverageTrueRange } from "./averageTrueRange";
import { Maximum } from "./maximum";
import { Minimum } from "./minimum";

type NormalizedAverageTrueRangeValue = {
  natr: number;
  drop: number;
  gain: number;
};

export class NormalizedAverageTrueRange {
  private atr: AverageTrueRange;
  private max: Maximum;
  private min: Minimum;

  constructor(period: number) {
    this.atr = new AverageTrueRange(period);
    this.max = new Maximum(period);
    this.min = new Minimum(period);
  }

  next(input: number | KLineData): NormalizedAverageTrueRangeValue {
    const atr = this.atr.next(input);
    const close = typeof input === "number" ? input : input.close;
    const natr = (atr / close) * 100.0;
    const max = this.max.next(natr);
    const min = this.min.next(natr);
    const drop = (max - natr) / max;
    const gain = (natr - min) / min;

    return { natr, drop, gain };
  }
}

registerIndicator<NormalizedAverageTrueRangeValue, number>({
  name: "NATR",
  calcParams: [14],
  precision: 2,
  figures: [
    { key: "natr", title: "NATR: ", type: "line" },
    { key: "drop", title: "DROP: ", type: "line" },
    { key: "gain", title: "GAIN: ", type: "line" },
  ],
  calc: (kLineDataList, indicator) => {
    const [period] = indicator.calcParams;
    const nextAtr = new NormalizedAverageTrueRange(period);

    return kLineDataList.map((kLineData) => nextAtr.next(kLineData));
  },
});
