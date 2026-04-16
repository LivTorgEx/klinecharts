export class LinearRegression {
    constructor(period) {
        this.period = period;
        this.window = [];
    }
    calculate() {
        const n = this.window.length;
        const mean_x = (n - 1.0) / 2.0;
        const mean_y = this.window.reduce((a, b) => a + b, 0) / n;
        let numerator = 0.0;
        let denominator = 0.0;
        this.window.forEach((y, x) => {
            numerator += (x - mean_x) * (y - mean_y);
            denominator += Math.pow(x - mean_x, 2);
        });
        const slope = numerator / denominator;
        const intercept = mean_y - slope * mean_x;
        const last_x = n - 1.0;
        return intercept + slope * last_x;
    }
    next(value) {
        if (this.window.length == this.period) {
            this.window.shift();
        }
        this.window.push(value);
        if (this.window.length == this.period) {
            return this.calculate();
        }
        else {
            return undefined;
        }
    }
}
