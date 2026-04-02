import { KLineData, registerIndicator } from "klinecharts";

import { Minimum } from "./minimum";
import { Maximum } from "./maximum";
import { SimpleMovingAverage } from "./simpleMovingAverage";

type StochasticOutput = {
  k: number;
  d: number;
};

export class Stochastic {
  private lowest: Minimum;
  private highest: Maximum;
  private smothK: SimpleMovingAverage;
  private smothD: SimpleMovingAverage;

  constructor(
    private period: number,
    smothK: number,
    smothD: number
  ) {
    this.lowest = new Minimum(period);
    this.highest = new Maximum(period);
    this.smothK = new SimpleMovingAverage(smothK);
    this.smothD = new SimpleMovingAverage(smothD);
  }

  next(input: KLineData): StochasticOutput {
    const lowest = this.lowest.next(input.low);
    const highest = this.highest.next(input.high);

    const stoch = (100 * (input.close - lowest)) / (highest - lowest);
    const k = this.smothK.next(stoch);

    return {
      k,
      d: this.smothD.next(k),
    };
  }
}

registerIndicator<StochasticOutput, number>({
  name: "Stochastic",
  shortName: "Stoch",
  precision: 5,
  calcParams: [14, 1, 3],
  figures: [
    { key: "k", title: "K: ", type: "line" },
    { key: "d", title: "D: ", type: "line" },
  ],
  calc: (kLineDataList, indicator) => {
    const [periodK, smothK, periodD] = indicator.calcParams;
    const nextStoch = new Stochastic(periodK, smothK, periodD);

    return kLineDataList.map(
      (kLineData): StochasticOutput => nextStoch.next(kLineData)
    );
  },
});
