import { registerIndicator } from "klinecharts";
import { TrueRange } from "./trueRange";
import { RelativeMovingAverage } from "./relativeMovingAverage";
export class AverageTrueRange {
    constructor(period) {
        this.trueRange = new TrueRange();
        this.rma = new RelativeMovingAverage(period);
    }
    next(input) {
        return this.rma.next(this.trueRange.next(input));
    }
}
registerIndicator({
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
