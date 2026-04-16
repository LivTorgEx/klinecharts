import { registerIndicator } from "klinecharts";
export class MoneyFlowIndex {
    constructor(period) {
        this.period = period;
        this.index = 0;
        this.count = 0;
        this.previousTypicalPrice = 0;
        this.totalPositiveMoneyFlow = 0;
        this.totalNegativeMoneyFlow = 0;
        this.deque = new Array(period).fill(0);
    }
    next(input) {
        const tp = (input.close + input.high + input.low) / 3.0;
        if (this.index + 1 < this.period) {
            this.index += 1;
        }
        else {
            this.index = 0;
        }
        if (this.count < this.period) {
            this.count += 1;
            if (this.count === 1) {
                this.previousTypicalPrice = tp;
                return 50.0;
            }
        }
        else {
            const popped = this.deque[this.index];
            if (popped >= 0) {
                this.totalPositiveMoneyFlow -= popped;
            }
            else {
                this.totalNegativeMoneyFlow += popped;
            }
        }
        if (tp > this.previousTypicalPrice) {
            const rawMoneyFlow = tp * input.volume;
            this.totalPositiveMoneyFlow += rawMoneyFlow;
            this.deque[this.index] = rawMoneyFlow;
        }
        else if (tp < this.previousTypicalPrice) {
            const rawMoneyFlow = tp * input.volume;
            this.totalNegativeMoneyFlow += rawMoneyFlow;
            this.deque[this.index] = -rawMoneyFlow;
        }
        else {
            this.deque[this.index] = 0.0;
        }
        this.previousTypicalPrice = tp;
        const mfi = (this.totalPositiveMoneyFlow /
            (this.totalPositiveMoneyFlow + this.totalNegativeMoneyFlow)) *
            100.0;
        return mfi;
    }
}
registerIndicator({
    name: "MFI",
    shortName: "MFI",
    calcParams: [14],
    minValue: 0,
    maxValue: 100,
    precision: 2,
    figures: [{ key: "mfi", title: "MFI: ", type: "line" }],
    calc: (kLineDataList, indicator) => {
        const [period] = indicator.calcParams;
        const nextMFI = new MoneyFlowIndex(period);
        return kLineDataList.map((kLineData) => ({
            mfi: nextMFI.next(kLineData),
        }));
    },
});
