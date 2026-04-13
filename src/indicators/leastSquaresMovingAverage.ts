import { KLineData, registerIndicator } from "klinecharts";

import { LinearRegression } from "./linearRegression";

type LeastSquaresMovingAverageValue = {
  lsma?: number;
};

class LeastSquaresMovingAverage {
  private regression: LinearRegression;

  constructor(private period: number) {
    this.regression = new LinearRegression(period);
  }

  next(input: number | KLineData): number | undefined {
    const value = typeof input === "number" ? input : input.close;

    return this.regression.next(value);
  }
}

registerIndicator<LeastSquaresMovingAverageValue, number>({
  name: "LSMA",
  precision: 12,
  calcParams: [50],
  figures: [{ key: "lsma", title: "LSMA: ", type: "line" }],
  calc: (kLineDataList, indicator) => {
    const [period] = indicator.calcParams;
    const nextLSMA = new LeastSquaresMovingAverage(period);

    return kLineDataList.map(
      (kLineData): LeastSquaresMovingAverageValue => ({
        lsma: nextLSMA.next(kLineData),
      })
    );
  },
});
