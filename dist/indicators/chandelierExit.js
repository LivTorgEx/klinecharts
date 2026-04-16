import { registerIndicator } from "klinecharts";
import { AverageTrueRange } from "./averageTrueRange";
import { Maximum } from "./maximum";
import { Minimum } from "./minimum";
import { OrderDirection } from "../types/client/order";
class ChandelierExit {
    constructor(period, multiplier) {
        this.period = period;
        this.multiplier = multiplier;
        this.atr = new AverageTrueRange(period);
        this.min = new Minimum(period);
        this.max = new Maximum(period);
    }
    next(input) {
        const atr = this.atr.next(input) * this.multiplier;
        const min = this.min.next(input);
        const max = this.max.next(input);
        return {
            long: max - atr,
            short: min + atr,
        };
    }
}
registerIndicator({
    name: "CE",
    precision: 12,
    calcParams: [22, 3],
    figures: [
        {
            key: "ceLong",
            title: "Long: ",
            type: "line",
            styles: ({ defaultStyles }) => {
                return { color: defaultStyles.circles[0].upColor, size: 2 };
            },
        },
        {
            key: "ceShort",
            title: "Short: ",
            type: "line",
            styles: ({ defaultStyles }) => {
                return { color: defaultStyles.circles[0].downColor, size: 2 };
            },
        },
    ],
    calc: (kLineDataList, indicator) => {
        const [period, multiplier] = indicator.calcParams;
        const nextCE = new ChandelierExit(period, multiplier);
        let prevValue = undefined;
        return kLineDataList.map((input) => {
            const value = nextCE.next(input);
            const long = prevValue?.long ?? value.long;
            const short = prevValue?.short ?? value.short;
            let direction = prevValue?.direction ?? OrderDirection.BOTH;
            if (input.close > short) {
                direction = OrderDirection.LONG;
            }
            else if (input.close < long) {
                direction = OrderDirection.SHORT;
            }
            prevValue = {
                ...value,
                ceLong: direction === OrderDirection.LONG ? value.long : undefined,
                ceShort: direction === OrderDirection.SHORT ? value.short : undefined,
                direction,
            };
            return prevValue;
        });
    },
});
