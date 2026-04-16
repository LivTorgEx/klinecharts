import { registerIndicator } from "klinecharts";
export class RelativeMovingAverage {
    constructor(period) {
        this.current = 0;
        this.isNew = true;
        this.k = 1 / period;
    }
    next(input) {
        if (this.isNew) {
            this.isNew = false;
            this.current = input;
        }
        else {
            this.current = this.k * input + (1.0 - this.k) * this.current;
        }
        return this.current;
    }
}
registerIndicator({
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
