export class Accumulator {
    constructor(period) {
        this.period = period;
        this.index = 0;
        this.acc = 0;
        this.deque = [];
        this.deque = new Array(period).fill(0);
    }
    next(input) {
        this.acc += input;
        const popped = this.deque[this.index];
        this.acc -= popped;
        this.deque[this.index] = input;
        this.index = this.index + 1 < this.period ? this.index + 1 : 0;
        return this.acc;
    }
}
