import { getFigureClass, registerIndicator } from "klinecharts";
import { toMeasurePrice } from "../utils/number";
export class ImbalanceIndicator {
    constructor(maxImbalances = 10) {
        this.maxImbalances = maxImbalances;
        this.windowSize = 2;
        this.priceHistory = [];
        this.imbalances = [];
    }
    getImbalances() {
        return this.imbalances;
    }
    next(input) {
        if (this.priceHistory.length < this.windowSize) {
            this.priceHistory.push(input);
            return;
        }
        const candle1 = this.priceHistory[0];
        let imbalance = undefined;
        if (candle1.low > input.high) {
            imbalance = {
                timestamp: candle1.timestamp,
                high: candle1.low,
                low: input.high,
                type: "Bullish",
            };
        }
        else if (candle1.high < input.low) {
            imbalance = {
                timestamp: candle1.timestamp,
                high: input.low,
                low: candle1.high,
                type: "Bearish",
            };
        }
        this.priceHistory.push(input);
        if (this.priceHistory.length > this.windowSize) {
            this.priceHistory.shift();
        }
        this.imbalances = this.imbalances.filter((imbalance) => imbalance.type === "Bearish"
            ? imbalance.low < input.low
            : imbalance.high > input.high);
        if (!imbalance) {
            return;
        }
        if (toMeasurePrice(imbalance.low, imbalance.high) < 0.8) {
            return;
        }
        this.imbalances.push(imbalance);
        if (this.imbalances.length > this.maxImbalances) {
            this.imbalances.shift();
        }
    }
}
registerIndicator({
    name: "Imbalance",
    shortName: "Imbalance",
    series: "price",
    draw: ({ ctx, indicator, xAxis, yAxis, chart }) => {
        const { from, to } = chart.getVisibleRange();
        const defaultStyles = chart.getStyles().indicator;
        const { result } = indicator;
        const FigureRect = getFigureClass("rect");
        result
            .filter(({ index }) => index >= from && index <= to)
            .forEach((block) => {
            const x = xAxis.convertToPixel(block.index);
            const y = yAxis.convertToPixel(block.high);
            const height = Math.abs(yAxis.convertToPixel(block.low) - y);
            const width = xAxis.convertToPixel(block.index + 200) - x;
            new FigureRect({
                name: "rect",
                attrs: { x, y, height, width },
                styles: {
                    ...defaultStyles.bars[0],
                    color: block.backgroundColor,
                    borderSize: 20,
                    borderStyle: "solid",
                    borderColor: block.borderColor,
                    borderRadius: 2,
                },
            }).draw(ctx);
        });
        return false;
    },
    calc: (kLineDataList) => {
        const nextImbalance = new ImbalanceIndicator();
        kLineDataList.forEach((kLineData) => {
            nextImbalance.next(kLineData);
        });
        const imbalances = nextImbalance.getImbalances();
        const blocks = [];
        kLineDataList.map((kLineData, idx) => {
            const block = imbalances.find((im) => im.timestamp === kLineData.timestamp);
            if (block) {
                blocks.push({
                    index: idx,
                    high: block.high,
                    low: block.low,
                    backgroundColor: block.type === "Bullish"
                        ? "rgba(0,255,0,0.3)"
                        : "rgba(255,0,0,0.3)",
                    borderColor: block.type === "Bullish" ? "green" : "red",
                });
            }
        });
        return blocks;
    },
});
