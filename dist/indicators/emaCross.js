import { registerIndicator } from "klinecharts";
import { ExponentialMovingAverage } from "./exponentialMovingAverage";
import { OrderDirection } from "../types/client/order";
class EmaCross {
    constructor(periodFast, periodSlow) {
        this.direction = OrderDirection.BOTH;
        this.next = (input) => {
            const emaFast = this.emaFast.next(input.close);
            const emaSlow = this.emaSlow.next(input.close);
            const direction = emaSlow > emaFast ? OrderDirection.SHORT : OrderDirection.LONG;
            let isChanged = false;
            if (this.direction != direction) {
                this.direction = direction;
                isChanged = true;
            }
            return {
                emaFast,
                emaSlow,
                cross: isChanged ? input.close : undefined,
            };
        };
        this.emaFast = new ExponentialMovingAverage(periodFast);
        this.emaSlow = new ExponentialMovingAverage(periodSlow);
    }
}
registerIndicator({
    name: "EMACross",
    shortName: "EMACross",
    calcParams: [9, 26],
    precision: 12,
    figures: [
        { key: "emaFast", title: "Fast: ", type: "line" },
        { key: "emaSlow", title: "Slow: ", type: "line" },
    ],
    calc: (kLineDataList, indicator) => {
        const [periodFast, periodSlow] = indicator.calcParams;
        const emaCross = new EmaCross(periodFast, periodSlow);
        return kLineDataList.map(emaCross.next);
    },
});
