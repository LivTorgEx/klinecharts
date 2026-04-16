import { registerIndicator } from "klinecharts";
import { Accumulator } from "./accumulator";
export class SimpleMovingAverage {
    constructor(period) {
        this.period = period;
        this.acc = new Accumulator(period);
    }
    next(input) {
        const acc = this.acc.next(input);
        return acc / this.period;
    }
}
registerIndicator({
    name: "LTE_SMA",
    shortName: "SMA",
    calcParams: [9],
    precision: 12,
    figures: [{ key: "sma", title: "SMA: ", type: "line" }],
    calc: (kLineDataList, indicator) => {
        const [periodK] = indicator.calcParams;
        const nextSMA = new SimpleMovingAverage(periodK);
        return kLineDataList.map((kLineData) => ({
            sma: nextSMA.next(kLineData.close),
        }));
    },
});
