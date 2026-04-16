export class Maximum {
    constructor(period) {
        this.period = period;
        this.maxIndex = 0;
        this.curIndex = 0;
        this.deque = [];
    }
    findMaxIndex() {
        let max = -Infinity;
        let index = 0;
        this.deque.forEach((val, idx) => {
            if (val > max) {
                max = val;
                index = idx;
            }
        });
        return index;
    }
    next(input) {
        const value = typeof input === "number" ? input : input.high;
        this.deque[this.curIndex] = value;
        if (value > this.deque[this.maxIndex]) {
            this.maxIndex = this.curIndex;
        }
        else if (this.maxIndex == this.curIndex) {
            this.maxIndex = this.findMaxIndex();
        }
        this.curIndex = this.curIndex + 1 < this.period ? this.curIndex + 1 : 0;
        return this.deque[this.maxIndex];
    }
}
