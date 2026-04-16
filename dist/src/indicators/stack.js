export class Stack {
    constructor(period) {
        this.period = period;
        this.deque = [];
        this.deque = [];
    }
    get(idx) {
        return this.deque[idx];
    }
    // Get value or use defaultValue or 0
    nz(idx, defaultValue) {
        return this.deque[idx] || defaultValue || 0;
    }
    next(input) {
        this.deque.unshift(input);
        if (this.deque.length > this.period) {
            this.deque.pop();
        }
    }
}
