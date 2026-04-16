import { getFigureClass, registerIndicator, } from "klinecharts";
class SignalLib {
    constructor(depth, deviation, backstep, mintick = 0.00001) {
        this.initialized = false;
        this.lows = [];
        this.highs = [];
        this.zeeIdx = 0;
        this.zee1Idx = 0;
        this.zee2Idx = 0;
        this.currentIdx = 0;
        this.prevDirection = 1;
        // History arrays for barssince computations
        this.historyHrCond = [];
        this.historyLrCond = [];
        this.historyDirCond = [];
        // Previous raw expressions (before the `[1]` shift)
        this.prevExprHigh = null;
        this.prevExprLow = null;
        this.depth = depth;
        this.deviation = deviation;
        this.backstep = backstep;
        this.mintick = mintick;
        this.zee = { time: 0, price: 0 };
        this.zee1 = { time: 0, price: 0 };
        this.zee2 = { time: 0, price: 0 };
    }
    highestIndex(data, depth) {
        if (data.length === 0)
            return 0;
        const start = Math.max(0, data.length - depth);
        let idx = start;
        let max = -Infinity;
        for (let i = start; i < data.length; i++) {
            if (data[i] > max) {
                max = data[i];
                idx = i;
            }
        }
        return idx;
    }
    lowestIndex(data, depth) {
        if (data.length === 0)
            return 0;
        const start = Math.max(0, data.length - depth);
        let idx = start;
        let min = Infinity;
        for (let i = start; i < data.length; i++) {
            if (data[i] < min) {
                min = data[i];
                idx = i;
            }
        }
        return idx;
    }
    next(kLineData, index) {
        this.currentIdx = index;
        const { timestamp: time, low, high } = kLineData;
        this.lows.push(low);
        this.highs.push(high);
        if (this.lows.length > this.depth + 1) {
            this.lows.shift();
            this.highs.shift();
        }
        else {
            return;
        }
        if (!this.initialized) {
            this.zee = { time, price: low };
            this.zee1 = { ...this.zee };
            this.zee2 = { time, price: high };
            this.zeeIdx = index;
            this.zee1Idx = index;
            this.zee2Idx = index;
            this.initialized = true;
        }
        const hr_i = this.highestIndex(this.highs, this.depth);
        const lr_i = this.lowestIndex(this.lows, this.depth);
        const highestVal = this.highs[hr_i];
        const lowestVal = this.lows[lr_i];
        const exprHigh = highestVal - high > this.deviation * this.mintick;
        const exprLow = low - lowestVal > this.deviation * this.mintick;
        // Seed previous expressions to honor the `[1]` shift
        if (this.prevExprHigh === null || this.prevExprLow === null) {
            this.prevExprHigh = exprHigh;
            this.prevExprLow = exprLow;
            return;
        }
        const hrCond = !this.prevExprHigh; // not(exprHigh[1])
        const lrCond = !this.prevExprLow; // not(exprLow[1])
        this.historyHrCond.push(hrCond);
        this.historyLrCond.push(lrCond);
        // Keep history size bounded
        const maxHistory = this.depth + this.backstep + 5;
        if (this.historyHrCond.length > maxHistory) {
            this.historyHrCond.shift();
            this.historyLrCond.shift();
            this.historyDirCond.shift();
        }
        const hrSince = this.barSinceTrue(this.historyHrCond);
        const lrSince = this.barSinceTrue(this.historyLrCond);
        const hrGtLr = hrSince > lrSince;
        // Direction condition: not(hr > lr)
        this.historyDirCond.push(!hrGtLr);
        const holdSince = this.barSinceTrue(this.historyDirCond);
        const direction = holdSince >= this.backstep ? -1 : 1;
        if (direction !== this.prevDirection) {
            this.zee1 = { ...this.zee2 };
            this.zee2 = { ...this.zee };
            this.zee1Idx = this.zee2Idx;
            this.zee2Idx = this.zeeIdx;
        }
        if (direction > 0) {
            if (high > this.zee2.price) {
                this.zee2 = { time, price: high };
                this.zee = { time, price: low };
                this.zee2Idx = index;
                this.zeeIdx = index;
            }
            if (low < this.zee.price) {
                this.zee = { time, price: low };
                this.zeeIdx = index;
            }
        }
        else {
            if (low < this.zee2.price) {
                this.zee2 = { time, price: low };
                this.zee = { time, price: high };
                this.zee2Idx = index;
                this.zeeIdx = index;
            }
            if (high > this.zee.price) {
                this.zee = { time, price: high };
                this.zeeIdx = index;
            }
        }
        this.prevDirection = direction;
        this.prevExprHigh = exprHigh;
        this.prevExprLow = exprLow;
    }
    barSinceTrue(history) {
        if (history.length === 0)
            return 0;
        const last = history.length - 1;
        for (let i = last; i >= 0; i--) {
            if (history[i]) {
                return last - i;
            }
        }
        return last + 1; // never true in history
    }
    getState() {
        return {
            direction: this.prevDirection,
            zee1: this.zee1,
            zee2: this.zee2,
            zee2Index: this.zee2Idx,
        };
    }
}
registerIndicator({
    name: "DirectionalPivotSignal",
    calcParams: [12, 5, 2],
    precision: 12,
    calc: (kLineDataList, indicator) => {
        const [depth, deviation, backstep] = indicator.calcParams;
        const engine = new SignalLib(depth, deviation, backstep);
        const result = [];
        kLineDataList.forEach((k, idx) => {
            engine.next(k, idx);
            result.push(engine.getState());
        });
        return result;
    },
    draw: ({ ctx, indicator, xAxis, yAxis, chart }) => {
        var _a;
        const { result } = indicator;
        const { from, to } = chart.getVisibleRange();
        if (!result || result.length === 0) {
            return false;
        }
        const FigureText = getFigureClass("text");
        const arrowHeight = 8;
        const cornerRadius = 6;
        const verticalGap = 6;
        const paddingX = 10;
        const paddingY = 6;
        // Track direction changes to draw labels
        for (let i = 1; i < result.length; i++) {
            const current = result[i];
            const previous = result[i - 1];
            // Check if direction changed
            if (current.direction !== previous.direction && current.zee2) {
                // Anchor label to the bar where zee2 was set
                const index = (_a = current.zee2Index) !== null && _a !== void 0 ? _a : i;
                const price = current.zee2.price;
                // Only draw if in visible range
                if (index >= from && index <= to) {
                    const x = xAxis.convertToPixel(index);
                    const y = yAxis.convertToPixel(price);
                    // Draw label
                    const labelText = current.direction > 0 ? "Sell-point" : "Buy-point";
                    const bgColor = current.direction > 0 ? "#fc0808" : "#03ff85";
                    ctx.save();
                    ctx.font = "12px Arial";
                    const textWidth = ctx.measureText(labelText).width;
                    const rectWidth = textWidth + paddingX * 2;
                    const rectHeight = 12 + paddingY * 2; // 12px font height approximation
                    const isBuy = current.direction < 0;
                    const rectX = x - rectWidth / 2;
                    const rectY = isBuy
                        ? y + arrowHeight + verticalGap
                        : y - rectHeight - arrowHeight - verticalGap;
                    // Bubble with rounded corners and pointer
                    ctx.beginPath();
                    // Top left corner
                    ctx.moveTo(rectX + cornerRadius, rectY);
                    // Top edge
                    ctx.lineTo(rectX + rectWidth - cornerRadius, rectY);
                    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius);
                    // Right edge
                    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
                    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - cornerRadius, rectY + rectHeight);
                    // Bottom edge with arrow for sell (pointing down)
                    if (!isBuy) {
                        const baseY = rectY + rectHeight;
                        ctx.lineTo(x + 8, baseY);
                        ctx.lineTo(x, baseY + arrowHeight);
                        ctx.lineTo(x - 8, baseY);
                    }
                    ctx.lineTo(rectX + cornerRadius, rectY + rectHeight);
                    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - cornerRadius);
                    // Left edge
                    ctx.lineTo(rectX, rectY + cornerRadius);
                    ctx.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY);
                    // Top edge with arrow for buy (pointing up)
                    if (isBuy) {
                        ctx.moveTo(x - 8, rectY);
                        ctx.lineTo(x, rectY - arrowHeight);
                        ctx.lineTo(x + 8, rectY);
                    }
                    ctx.closePath();
                    ctx.fillStyle = bgColor;
                    ctx.fill();
                    new FigureText({
                        name: "text",
                        attrs: {
                            x: x,
                            y: rectY + rectHeight / 2,
                            text: labelText,
                            align: "center",
                            baseline: "middle",
                        },
                        styles: {
                            color: "#000000",
                            size: 12,
                            family: "Arial",
                        },
                    }).draw(ctx);
                    ctx.restore();
                }
            }
        }
        return false;
    },
});
