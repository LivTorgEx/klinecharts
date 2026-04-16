import { getFigureClass, registerIndicator, } from "klinecharts";
export class Point {
    constructor(price, index, isHigh) {
        this.price = price;
        this.index = index;
        this.isHigh = isHigh;
    }
    isMorePrice(point, prevPoint) {
        const m = this.isHigh ? 1 : -1;
        return point.price * m > prevPoint.price * m;
    }
}
export class ZigZag {
    constructor(deviationThreshold, depth) {
        this.deviationThreshold = deviationThreshold;
        this.depth = depth;
        this.highPrices = [];
        this.lowPrices = [];
        this.points = [];
        this.index = 0;
    }
    findPivotPoint(prices, isHigh) {
        const length = Math.max(2, Math.floor(this.depth / 2));
        const pivotPrice = prices[prices.length - length];
        let isFound = true;
        for (let i = 0; i < length - 1; i++) {
            if ((isHigh && prices[prices.length - i] > pivotPrice) ||
                (!isHigh && prices[prices.length - i] < pivotPrice)) {
                isFound = false;
                break;
            }
        }
        for (let i = length; i < length * 2; i++) {
            if ((isHigh && prices[prices.length - i] > pivotPrice) ||
                (!isHigh && prices[prices.length - i] < pivotPrice)) {
                isFound = false;
                break;
            }
        }
        if (isFound) {
            return new Point(pivotPrice, this.index - length + 1, isHigh);
        }
        return;
    }
    newPivotPointFound(isHight, point) {
        if (!this.lastPoint) {
            this.lastPoint = point;
            return true;
        }
        if (this.lastPoint.isHigh === isHight) {
            if (this.endPoint && this.lastPoint.isMorePrice(point, this.endPoint)) {
                this.updatePoint(point);
                return false;
            }
        }
        else {
            const dev = this.calculateDeviation(this.lastPoint.price, point.price);
            if ((!this.lastPoint.isHigh && dev >= this.deviationThreshold) ||
                (this.lastPoint.isHigh && dev <= -this.deviationThreshold)) {
                this.points.push(this.lastPoint);
                this.lastPoint = point;
                return true;
            }
        }
        return false;
    }
    tryFindPivot(prices, isHight) {
        const newPoint = this.findPivotPoint(prices, isHight);
        return newPoint ? this.newPivotPointFound(isHight, newPoint) : false;
    }
    calculateDeviation(base, value) {
        return (100 * (value - base)) / Math.abs(base);
    }
    updatePoint(newPoint) {
        if (!this.lastPoint) {
            this.lastPoint = newPoint;
        }
        if (this.lastPoint.isHigh !== newPoint.isHigh) {
            this.lastPoint = newPoint;
        }
        if ((this.lastPoint.isHigh && this.lastPoint.price < newPoint.price) ||
            (!this.lastPoint.isHigh && this.lastPoint.price > newPoint.price)) {
            this.lastPoint = newPoint;
        }
    }
    next(input) {
        var _a;
        this.highPrices.push(input.high);
        this.lowPrices.push(input.low);
        if (this.highPrices.length < this.depth) {
            this.index += 1;
            return;
        }
        const lastPoint = this.lastPoint;
        const somethingChanged = this.tryFindPivot(this.highPrices, true) ||
            this.tryFindPivot(this.lowPrices, false);
        this.endPoint = new Point(input.close, this.index, ((_a = this.lastPoint) === null || _a === void 0 ? void 0 : _a.isHigh) || true);
        this.index += 1;
        if (somethingChanged && lastPoint) {
            return lastPoint;
        }
        return undefined;
    }
    getPoints() {
        return this.points;
    }
}
registerIndicator({
    name: "ZigZag",
    calcParams: [1.5, 10],
    precision: 12,
    calc: (kLineDataList, indicator) => {
        const [threshold, depth] = indicator.calcParams;
        const nextZigZag = new ZigZag(threshold, depth);
        const result = Array.from({
            length: kLineDataList.length,
        });
        kLineDataList.forEach((kLineData) => {
            const nextPrice = nextZigZag.next(kLineData);
            if (nextPrice) {
                result[nextPrice.index] = { price: nextPrice.price };
            }
        });
        if (nextZigZag.lastPoint) {
            result[nextZigZag.lastPoint.index] = {
                price: nextZigZag.lastPoint.price,
            };
        }
        if (nextZigZag.endPoint) {
            result[nextZigZag.endPoint.index] = {
                price: nextZigZag.endPoint.price,
            };
        }
        return result;
    },
    draw: ({ ctx, chart, indicator, xAxis, yAxis }) => {
        const { from, to } = chart.getVisibleRange();
        const defaultStyles = chart.getStyles().indicator;
        const coordinates = [];
        const { result } = indicator;
        const Figure = getFigureClass("line");
        if (!Figure) {
            return false;
        }
        for (let i = from - 1; i > 0; i--) {
            const data = result[i];
            if (data) {
                coordinates.push({
                    x: xAxis.convertToPixel(i),
                    y: yAxis.convertToPixel(data.price),
                });
                break;
            }
        }
        for (let i = from; result.length > i; i++) {
            const data = result[i];
            if (data) {
                coordinates.push({
                    x: xAxis.convertToPixel(i),
                    y: yAxis.convertToPixel(data.price),
                });
                if (i > to && coordinates.length > 2) {
                    break;
                }
            }
        }
        new Figure({
            name: "line",
            attrs: [{ coordinates }],
            styles: { ...defaultStyles.lines[0], size: 2, color: "#2962FF" },
        }).draw(ctx);
        return false;
    },
});
