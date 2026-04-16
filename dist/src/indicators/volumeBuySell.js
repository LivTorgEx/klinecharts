import { registerIndicator } from "klinecharts";
import { SimpleMovingAverage } from "./simpleMovingAverage";
import { AverageTrueRange } from "./averageTrueRange";
import { Accumulator } from "./accumulator";
registerIndicator({
    name: "VOL_BUY_SELL",
    shortName: "VOL_BUY_SELL",
    series: "volume",
    calcParams: [14],
    shouldFormatBigNumber: true,
    precision: 0,
    minValue: 0,
    figures: [
        // { key: "volumeDelta", title: "Volume: ", type: "line" },
        // { key: "smaV", title: "Volume: ", type: "line" },
        // { key: "atrV", title: "Volume ATR: ", type: "line" },
        // { key: "accV", title: "Volume Acc: ", type: "line" },
        { key: "nVolume", title: "Volume Normalized: ", type: "line" },
    ],
    calc: (dataList, indicator) => {
        const { calcParams: [period], } = indicator;
        const sma = new SimpleMovingAverage(period);
        const atr = new AverageTrueRange(period);
        const acc = new Accumulator(period);
        return dataList.map((kLineData) => {
            const buy = typeof kLineData["buy"] === "number" ? kLineData["buy"] : 0;
            const sell = typeof kLineData["sell"] === "number" ? kLineData["sell"] : 0;
            const volumeDelta = buy - sell;
            const atrV = atr.next(volumeDelta);
            const smaV = sma.next(volumeDelta);
            const accV = acc.next(volumeDelta);
            const nVolume = volumeDelta ? volumeDelta / atrV : 0;
            return {
                volumeDelta,
                smaV,
                atrV,
                nVolume,
                accV,
            };
        });
    },
});
