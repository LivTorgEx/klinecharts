import { registerIndicator } from "klinecharts";
import { LinearRegression } from "./linearRegression";
class LeastSquaresMovingAverage {
    constructor(period) {
        this.period = period;
        this.regression = new LinearRegression(period);
    }
    next(input) {
        const value = typeof input === "number" ? input : input.close;
        return this.regression.next(value);
    }
}
registerIndicator({
    name: "LSMA",
    precision: 12,
    calcParams: [50],
    figures: [{ key: "lsma", title: "LSMA: ", type: "line" }],
    calc: (kLineDataList, indicator) => {
        const [period] = indicator.calcParams;
        const nextLSMA = new LeastSquaresMovingAverage(period);
        return kLineDataList.map((kLineData) => ({
            lsma: nextLSMA.next(kLineData),
        }));
    },
});
