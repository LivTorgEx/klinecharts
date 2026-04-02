import { KLineData, registerIndicator } from "klinecharts";
import { ExponentialMovingAverage } from "./exponentialMovingAverage";
import { Maximum } from "./maximum";
import { Minimum } from "./minimum";

type StochasticMomentumIndexValue = {
  smi: number;
  smiBasedEma: number;
};

export class StochasticMomentumIndex {
  private smoothK: ExponentialMovingAverage;
  private smoothD: ExponentialMovingAverage;
  private doubleSmoothK: ExponentialMovingAverage;
  private doubleSmoothD: ExponentialMovingAverage;
  private smiBasedEma: ExponentialMovingAverage;
  private high: Maximum;
  private low: Minimum;

  constructor(
    private periodK: number,
    periodD: number,
    periodEMA: number
  ) {
    this.smoothK = new ExponentialMovingAverage(periodD);
    this.smoothD = new ExponentialMovingAverage(periodD);
    this.doubleSmoothK = new ExponentialMovingAverage(periodD);
    this.doubleSmoothD = new ExponentialMovingAverage(periodD);
    this.smiBasedEma = new ExponentialMovingAverage(periodEMA);
    this.high = new Maximum(periodK);
    this.low = new Minimum(periodK);
  }

  next(input: KLineData): StochasticMomentumIndexValue {
    const high = this.high.next(input.high);
    const low = this.low.next(input.low);

    const highestLowestRange = high - low;
    const relativeRange = input.close - (high + low) / 2;

    const dsc = this.doubleSmoothK.next(this.smoothK.next(relativeRange));
    const dsr = this.doubleSmoothD.next(this.smoothD.next(highestLowestRange));

    // SMI Calculation: avoid division by zero
    const smi = dsr !== 0.0 ? 200.0 * (dsc / dsr) : 0.0;
    const smiBasedEma = this.smiBasedEma.next(smi);

    const current: StochasticMomentumIndexValue = {
      smi,
      smiBasedEma,
    };

    return current;
  }
}

registerIndicator<StochasticMomentumIndexValue, number>({
  name: "SMI",
  maxValue: 100,
  minValue: -100,
  calcParams: [25, 3, 3],
  precision: 2,
  figures: [
    { key: "smi", title: "SMI: ", type: "line" },
    { key: "smiBasedEma", title: "SMI EMA: ", type: "line" },
  ],
  calc: (kLineDataList, indicator) => {
    const [periodK, periodD, periodEMA] = indicator.calcParams;
    const nextSMI = new StochasticMomentumIndex(periodK, periodD, periodEMA);

    return kLineDataList.map((kLineData) => nextSMI.next(kLineData));
  },
});
