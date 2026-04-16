export class ExponentialMovingAverage {
    constructor(period) {
        this.current = 0;
        this.isNew = true;
        this.period = period;
        this.k = 2.0 / (period + 1);
    }
    next(input) {
        if (this.isNew) {
            this.isNew = false;
            this.current = input;
        }
        else {
            this.current = this.k * input + (1.0 - this.k) * this.current;
        }
        return this.current;
    }
}
