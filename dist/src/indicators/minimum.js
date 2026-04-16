export class Minimum {
    constructor(period) {
        this.period = period;
        this.minIndex = 0;
        this.curIndex = 0;
        this.deque = [];
    }
    findMinIndex() {
        let min = Infinity;
        let index = 0;
        this.deque.forEach((val, idx) => {
            if (val < min) {
                min = val;
                index = idx;
            }
        });
        return index;
    }
    next(input) {
        const value = typeof input === "number" ? input : input.low;
        this.deque[this.curIndex] = value;
        if (value < this.deque[this.minIndex]) {
            this.minIndex = this.curIndex;
        }
        else if (this.minIndex == this.curIndex) {
            this.minIndex = this.findMinIndex();
        }
        this.curIndex = this.curIndex + 1 < this.period ? this.curIndex + 1 : 0;
        return this.deque[this.minIndex];
    }
}
