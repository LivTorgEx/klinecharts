import { KLineData } from "klinecharts";

export class Minimum {
  private minIndex: number = 0;
  private curIndex: number = 0;
  private deque: number[];

  constructor(private period: number) {
    this.deque = [];
  }

  findMinIndex(): number {
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

  next(input: number | KLineData): number {
    const value = typeof input === "number" ? input : input.low;
    this.deque[this.curIndex] = value;

    if (value < this.deque[this.minIndex]) {
      this.minIndex = this.curIndex;
    } else if (this.minIndex == this.curIndex) {
      this.minIndex = this.findMinIndex();
    }

    this.curIndex = this.curIndex + 1 < this.period ? this.curIndex + 1 : 0;

    return this.deque[this.minIndex];
  }
}
