import { registerIndicator } from "klinecharts";
import { SimpleMovingAverage } from "./simpleMovingAverage";
registerIndicator({
    name: "VOL_GD",
    shortName: "VOL_GD",
    series: "volume",
    calcParams: [50],
    shouldFormatBigNumber: true,
    precision: 0,
    minValue: 0,
    figures: [{ key: "gain", title: "GAIN: ", type: "line" }],
    calc: (dataList, indicator) => {
        const { calcParams: [period], } = indicator;
        const sma = new SimpleMovingAverage(period);
        return dataList.map((kLineData) => {
            const volume = kLineData.volume ?? 0;
            const smaV = sma.next(volume);
            return {
                gain: (volume - smaV) / smaV,
            };
        });
    },
});
